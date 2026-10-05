# EduVerse Azure VM Deployment and CI/CD Guide

This guide describes how the EduVerse project is deployed to an Azure Linux VM using Docker Compose, Nginx, Let's Encrypt, and GitHub Actions. It is written as both an operational checklist and viva-preparation notes.

## 1. Project Overview

EduVerse is a learning platform made up of a Next.js frontend, four backend services, and MySQL. Docker Compose builds and runs the containers on one VM.

| Component | Compose service | Container port | Published VM port |
| --- | --- | ---: | ---: |
| Next.js frontend | `frontend` | 3000 | 3000 |
| User service | `userservice` | 5000 | 5000 |
| Course service | `courseservice` | 5001 | 5001 |
| Purchase service | `purchaseservice` | 5002 | 5002 |
| AI service | `aiservice` | 8000 | 8000 |
| MySQL | `mysql` | 3306 | Not published to the public host |

The Compose project name used by the VM is `eduverse`. It scopes the containers and named database volume, so deployments must keep using `-p eduverse` to reuse the existing stack and `mysql_data` volume.

## 2. Request and Deployment Architecture

```text
Developer pushes to GitHub main
            |
            v
GitHub Actions runner
  - loads SSH key and pinned host key from GitHub Actions secrets
  - connects to the Azure VM over SSH
            |
            v
Azure VM: ~/Eduverse-source
  - fast-forward pulls main
  - Docker Compose rebuilds and recreates changed services
            |
            +--> frontend :3000
            +--> userservice :5000 ----+
            +--> courseservice :5001 ---+--> mysql (private Compose network)
            +--> purchaseservice :5002 -+
            +--> aiservice :8000

Browser --> eduversebd.tech:80/443 --> Nginx --> frontend :3000
```

Nginx serves the public website domain and proxies web traffic to the frontend. The current Compose file also publishes backend ports directly on the VM. For a production-hardening pass, restrict backend port access in the Azure Network Security Group or route APIs through HTTPS at Nginx; HTTPS on the website alone does not make direct plain-HTTP API calls secure.

## 3. Azure VM Setup

### SSH Login

From the computer that has the Azure private key, connect to the VM with:

```bash
chmod 600 ~/Downloads/edverseVM_key.pem
ssh -i ~/Downloads/edverseVM_key.pem azureuser@Public-IP
```

Replace the key path, username, and IP if Azure assigned different values. The first connection may ask you to trust the host key; verify the fingerprint using a trusted Azure/VM channel before accepting it. When connected, the prompt should resemble `azureuser@edverseVM:~$`. Log out with `exit`.

### VM and Network

1. Create an Ubuntu Linux VM and assign a stable public IP.
2. Add Azure Network Security Group inbound rules for SSH (`22`) from a restricted trusted IP range, and web traffic (`80` and `443`) from the internet.
3. Install Git, Docker Engine, and the Docker Compose plugin.
4. Add the deployment account to the Docker group if the workflow will run Docker Compose as that account. Docker access is effectively root-level access; protect the account and SSH key accordingly.
5. Confirm DNS A records for `eduversebd.tech` point to the VM public IP. Remove stale A records and remove an AAAA record unless the VM has working IPv6 configured.

In the Azure Portal, open the VM's **Networking** page and add inbound NSG rules for TCP 22 (preferably only your trusted IP), TCP 80, and TCP 443. The app container uses port 3000 behind Nginx; normally expose the website through 80/443 rather than exposing port 3000. Do not expose MySQL port 3306 publicly.

### Install VM Packages (Ubuntu)

Run these commands after SSH login. If Docker is already installed, check it with `docker --version` and `docker compose version` before reinstalling anything.

```bash
sudo apt update
sudo apt install -y git docker.io docker-compose-v2 nginx
sudo systemctl enable --now docker nginx
sudo usermod -aG docker "$USER"
```

After adding the user to the Docker group, log out and SSH in again for the new group membership to take effect. Docker group membership grants root-equivalent control of the VM.

### Clone the Project on the VM

The deployment workflow expects this exact repository path:

```bash
cd ~
git clone https://github.com/md-abdullah-92/Eduverse.git Eduverse-source
cd ~/Eduverse-source
```

If the repository is private, configure a read-only deploy key or another non-interactive GitHub authentication method on the VM so `git pull` can access it. Never put a personal access token directly in the workflow or shell history.

### Environment Files

Keep environment files on the VM. They are not transferred by the workflow and must not be committed:

- `~/Eduverse-source/.env` for host-level Compose substitutions such as `MYSQL_ROOT_PASSWORD`.
- `~/Eduverse-source/frontend/.env.local` for public frontend API URLs, Firebase web configuration, and `FRONTEND_ORIGIN` used by Compose at build/runtime.
- `microservices/Userservices/.env`.
- `microservices/courseService/.env`.
- `microservices/purchaseService/.env`.
- `microservices/AIService/.env`.

The frontend file needs these deployment settings; use the real deployment host and keep each URL aligned with the Nginx/API topology:

```dotenv
NEXT_PUBLIC_API_URL=https://eduversebd.tech/course-api/api
NEXT_PUBLIC_USER_API_URL=https://eduversebd.tech/user-api/api
NEXT_PUBLIC_API_BASE_URL=https://eduversebd.tech/course-api/api
NEXT_PUBLIC_BASE_URL=https://eduversebd.tech
NEXT_PUBLIC_PURCHASE_API_URL=https://eduversebd.tech/purchase-api/api/purchase
NEXT_PUBLIC_AI_API_URL=https://eduversebd.tech/ai-api
FRONTEND_ORIGIN=https://eduversebd.tech,https://eduversebd.tech/
```

These URLs replace only the IP address; the service ports remain `5000`, `5001`, `5002`, and `8000`. Each service must be reachable over HTTPS on its existing port, or the HTTPS gateway must terminate TLS while preserving these public port URLs. Rebuild the frontend after changing these values.

`NEXT_PUBLIC_*` values are inserted into the browser bundle during `next build`; setting them only in a running container is too late. After changing them, rebuild the frontend. Browsers block plain-HTTP API calls from an HTTPS page as mixed content, so use `https://` on these domain-and-port URLs.

Firebase `NEXT_PUBLIC_*` web configuration is visible to browsers by design. Do not put private API keys, passwords, mail credentials, Stripe secrets, or database credentials in `NEXT_PUBLIC_*` variables. Rotate credentials immediately if they are accidentally exposed.

### Start or Inspect Docker Compose

From `~/Eduverse-source` on the VM:

```bash
# Validate Compose interpolation/configuration without printing resolved values

docker compose --env-file .env --env-file frontend/.env.local -p eduverse config --quiet

# Build and start/update all services, reusing the named eduverse project and volume
docker compose --env-file .env --env-file frontend/.env.local -p eduverse up -d --build

# Show service/container status
docker compose -p eduverse ps

# Follow logs for a service
docker compose -p eduverse logs -f frontend
```

If there is no root `.env`, omit its `--env-file .env` argument. Do not use `docker compose down -v` during a normal deployment: `-v` deletes the MySQL data volume. The Compose MySQL health check waits for MySQL before starting the Node services; it does not prove every API route is healthy.

### First Deployment Command Sequence

Once the repository and all required environment files are present on the VM, the first deployment can be started with:

```bash
cd ~/Eduverse-source
docker compose --env-file .env --env-file frontend/.env.local -p eduverse config --quiet
docker compose --env-file .env --env-file frontend/.env.local -p eduverse up -d --build
docker compose -p eduverse ps
```

The `config --quiet` command validates that required Compose variables and files resolve. If the VM does not have a root `.env`, remove only `--env-file .env` from both commands. Check startup logs if a service is not `Up`:

```bash
docker compose -p eduverse logs --tail=100 mysql userservice courseservice purchaseservice aiservice frontend
```

To confirm the frontend locally on the VM:

```bash
curl -I http://127.0.0.1:3000
```

## 4. Domain, Nginx, and HTTPS

The domain must resolve to the VM public IP. Nginx listens on standard web ports while the frontend container listens on port 3000. A minimal HTTP reverse-proxy site is:

Create `/etc/nginx/sites-available/eduversebd.tech` with this command. The ACME location serves certificate challenge files directly from disk; all other web requests go to the Next.js container.

```bash
sudo tee /etc/nginx/sites-available/eduversebd.tech >/dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name eduversebd.tech;

    # Required for PDF upload requests from the AI generator pages.
    client_max_body_size 50M;

    location ^~ /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
        default_type text/plain;
        try_files $uri =404;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
```

After saving the Nginx site, verify and reload it:

```bash
sudo mkdir -p /var/www/letsencrypt/.well-known/acme-challenge
sudo ln -sf /etc/nginx/sites-available/eduversebd.tech /etc/nginx/sites-enabled/eduversebd.tech
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
curl -I http://eduversebd.tech
```

For Let's Encrypt HTTP-01 validation, DNS must consistently point to this VM, inbound port 80 must be open, and `/.well-known/acme-challenge/` must be reachable from the internet. Install Certbot and its Nginx plugin, then request and install the certificate:

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d eduversebd.tech
```

Certbot asks for an email, agreement to its terms, and permission to update Nginx. Enter a real email in the VM terminal; never send it or secrets to chat. On success, Certbot stores the certificate at `/etc/letsencrypt/live/eduversebd.tech/fullchain.pem` and private key at `/etc/letsencrypt/live/eduversebd.tech/privkey.pem`, updates the Nginx site, and configures renewal. If issuance fails with a challenge mismatch, inspect all authoritative DNS A/AAAA records, remove stale addresses, confirm Nginx serves the challenge path, and retry after DNS caches update. Do not repeatedly retry while DNS is inconsistent.

Open inbound TCP 443 in the Azure NSG. Then test HTTPS and renewal:

```bash
sudo nginx -t && sudo systemctl reload nginx
curl -Ik https://eduversebd.tech
sudo certbot renew --dry-run
```

Do not claim HTTPS is active until `curl -Ik` succeeds and the browser shows a valid certificate. Site TLS and API TLS are separate; direct browser calls to `http://20.40.48.234:5000` and other HTTP API ports will fail as mixed content from an HTTPS page. Before using the HTTPS site fully, proxy the API routes through HTTPS Nginx (or another TLS gateway), update the frontend API base URLs and `FRONTEND_ORIGIN` to `https://eduversebd.tech`, then rebuild the frontend image. Never solve mixed content by disabling browser security.

For PDF uploads routed through the AI service, set `client_max_body_size 50M;` (or larger if needed) in the active Nginx `server` block. This prevents 413 errors when uploading large study-note or quiz PDFs.

## 5. GitHub Actions CI/CD

The workflow is `.github/workflows/deploy-azure-vm.yml`. It is triggered by a push to `main`, and can also be started manually with `workflow_dispatch` from GitHub Actions.

### One-Time SSH Configuration

1. Create a dedicated Ed25519 deployment key pair on a trusted machine. The public key belongs in the VM account's `~/.ssh/authorized_keys`; the private key belongs only in GitHub Actions secrets.
2. Verify the VM host-key fingerprint through a trusted VM session. Put the matching `ssh-keyscan` host-key line into `AZURE_VM_KNOWN_HOSTS`. Do not disable strict host-key checking.
3. Confirm the deployment user can enter the repository directory, run `git pull --ff-only`, and execute Docker Compose.

Example key setup from a trusted local terminal (not a shared chat):

```bash
ssh-keygen -t ed25519 -C "eduverse-github-actions" -f ~/.ssh/eduverse_actions
```

Set a strong passphrase only if the workflow is also configured to unlock the key; the current workflow expects an unencrypted key. Install the public key on the VM, using your normal VM SSH identity:

```bash
ssh-copy-id -i ~/.ssh/eduverse_actions.pub azureuser@20.40.48.234
```

Verify the new key can authenticate before adding it to GitHub:

```bash
ssh -i ~/.ssh/eduverse_actions -o IdentitiesOnly=yes azureuser@20.40.48.234 'whoami'
```

It should print `azureuser`. Obtain the server host-key line, then compare its fingerprint with the fingerprint reported from a trusted VM session before using it:

```bash
ssh-keyscan -t ed25519 20.40.48.234 2>/dev/null > /tmp/azure-vm-known_hosts
ssh-keygen -lf /tmp/azure-vm-known_hosts
```

In the GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret**. Set `AZURE_VM_SSH_KEY` to the full contents of `~/.ssh/eduverse_actions` and `AZURE_VM_KNOWN_HOSTS` to the line in `/tmp/azure-vm-known_hosts`. Add `AZURE_VM_HOST=20.40.48.234` and `AZURE_VM_USER=azureuser` as separate secrets. Never paste the private key into chat, commit it, or print it in workflow logs.

The workflow uses these repository secrets under **Settings → Secrets and variables → Actions**:

| Secret | Value |
| --- | --- |
| `AZURE_VM_HOST` | VM public IP or DNS hostname |
| `AZURE_VM_USER` | SSH deployment user, e.g. `azureuser` |
| `AZURE_VM_SSH_KEY` | Full private Ed25519 key text, including BEGIN/END lines |
| `AZURE_VM_KNOWN_HOSTS` | Verified SSH host-key line for the VM |

Never commit, print, or send private-key contents in chat. GitHub masks secret values in logs, but the workflow should still avoid echoing them.

### What Happens on a Push

1. Developer commits and pushes code to `main`.
2. GitHub starts an Ubuntu runner and loads the SSH private key and pinned host key from secrets.
3. The runner connects to the VM using strict host-key verification.
4. It enters `~/Eduverse-source` and runs `git pull --ff-only`.
5. It runs Docker Compose with project name `eduverse` and rebuilds/recreates services.
6. It prints the Compose service status. The workflow run appears under the repository's **Actions** tab.

Example developer commands:

```bash
git add <changed-files>
git commit -m "Describe the change"
git push origin main
```

A commit that has not been pushed does not trigger GitHub Actions. A push to a branch other than `main` also does not trigger this workflow unless started manually or the workflow trigger is changed. A green run means the SSH and Compose commands completed; it is not an end-to-end browser or API health test.

### Deployment Checks and Troubleshooting

```bash
# On the VM
docker compose -p eduverse ps
docker compose -p eduverse logs --tail=100 frontend
docker compose -p eduverse logs --tail=100 userservice courseservice purchaseservice aiservice
curl -I http://127.0.0.1:3000
curl -I http://eduversebd.tech
curl -Ik https://eduversebd.tech
```

Common causes of a failed deployment:

- **SSH permission denied:** check the public key in `authorized_keys` and confirm the matching private key is the GitHub secret.
- **Host key verification failed:** verify the VM fingerprint and update `AZURE_VM_KNOWN_HOSTS`; do not turn off strict checking.
- **Compose says a required variable is missing:** ensure the VM's `.env` and `frontend/.env.local` exist and contain required Compose values.
- **Port already allocated:** there may be another Compose project publishing the same port. Deploy with `-p eduverse` to use the original project.
- **Domain connection refused:** confirm Nginx is running, DNS points to the VM, and Azure NSG rules allow 80/443.
- **API call fails from browser:** inspect the browser request URL, service logs, CORS origin, NSG rules, and whether HTTPS is calling an HTTP API.
- **Data appears missing:** check that the `eduverse` project name is unchanged and that its `mysql_data` volume still exists. Avoid `down -v`.

## 6. Viva Preparation: Questions and Answers

**Q: What is CI/CD?**  
CI (Continuous Integration) validates and integrates changes frequently. CD (Continuous Delivery/Deployment) automates delivery of those changes to an environment. In this setup, a push to `main` triggers an automated deployment workflow.

**Q: What triggers this deployment?**  
A push to the `main` branch or a manual `workflow_dispatch` run in GitHub Actions.

**Q: How does GitHub Actions access the VM securely?**  
It uses an SSH private key stored as a GitHub Actions secret and verifies the server against a pinned known-hosts entry. Strict host-key checking helps prevent connecting to an impersonated server.

**Q: Why are environment files kept on the VM?**  
They contain deployment-specific settings and credentials. Keeping them outside Git avoids exposing secrets and lets deployments update code without overwriting environment configuration.

**Q: Why use Docker Compose?**  
Compose defines the frontend, backend services, MySQL, networks, ports, dependencies, and persistent storage declaratively, so the same service topology can be started consistently.

**Q: How does the application reach MySQL?**  
Containers use the Compose service name `mysql` as the hostname on the private Compose network. The database port is not published to the VM's public interface in this Compose file.

**Q: How is database data retained during redeployment?**  
MySQL data is stored in the named `mysql_data` volume scoped to the `eduverse` Compose project. Rebuilding containers does not remove that volume. `docker compose down -v` would remove it and must be avoided unless data deletion is intended.

**Q: Why do frontend public environment values need to be set at build time?**  
Next.js inlines `NEXT_PUBLIC_*` values into browser JavaScript during `next build`. Changing only the container runtime environment does not change the already-built browser bundle.

**Q: What does Nginx do?**  
It accepts public HTTP/HTTPS traffic on standard ports and reverse-proxies website requests to the frontend container on port 3000. It can also terminate TLS when configured with a certificate.

**Q: What does Let's Encrypt validate?**  
The HTTP-01 challenge verifies domain control by requesting a token under `/.well-known/acme-challenge/` over port 80. DNS and network routing must reach the Nginx instance serving the token.

**Q: What does a green workflow run prove?**  
It proves the workflow commands completed, including SSH, Git pull, and Compose. It does not by itself prove every API endpoint or user journey works; separate health and browser checks are needed.

**Q: How would you improve production security?**  
Use HTTPS, restrict SSH and backend ports in the NSG, route browser APIs through a TLS reverse proxy, keep secrets in a secret manager, use a least-privilege deployment identity, add health checks and smoke tests, and monitor logs and backups.

## 7. CV-Ready Project Entry

**EduVerse | Microservices Learning Platform**  
*Technologies: Next.js, Node.js/Express, FastAPI, MySQL, Prisma, Docker Compose, Azure VM, Nginx, GitHub Actions*

- Deployed a containerized learning platform with a Next.js frontend, four backend services, and MySQL on an Azure Linux VM.
- Configured Nginx reverse proxy and Let's Encrypt TLS for domain-based web access.
- Created a GitHub Actions deployment workflow that connects to the VM over SSH, fast-forward pulls the `main` branch, and rebuilds the Docker Compose stack while preserving the database volume.

Use the final bullet only once the GitHub Actions secrets are configured and an Actions deployment run has completed successfully. Add measured outcomes (for example, uptime, users, or deployment time) only if you have verified figures.
