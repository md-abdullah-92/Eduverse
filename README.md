# 🎓 EduVerse - The Smart Learning Ecosystem
![EduVerse Logo](https://github.com/md-abdullah-92/Eduverse/blob/main/frontend/public/logo_c.png)

> 🚧 This project is currently under active development. Some features may be incomplete or in progress.

EduVerse is an AI-integrated online learning ecosystem where students and course creators collaborate, learn, and grow. The platform provides smart course creation tools, personalized AI feedback, real-time communication, and interactive progress tracking.

## 📚 Features (In Progress)

- **Course Creation Tool**: A drag-and-drop builder for easy course creation (work in progress).
- **Materials Storage**: Cloud storage for educational materials and pre-recorded content.
- **AI-Powered Personalized Learning**: AI-driven feedback for students based on their progress (coming soon).
- **Automated Grading System**: Automated grading for quizzes and assignments (under development).
- **Real-Time Communication**: Direct chat, group chats, and communication features (in progress).
- **Progress Tracking**: Students can track their learning journey and view their performance.
- **Payment Gateway**: Secure payments for course creators (planned feature).
- **Certificates & Digital Badges**: Issuance of certificates and badges upon course completion (coming soon).

---

## 🔧 Installation

### 1. Clone the Repository

Clone the EduVerse repository from GitHub:

```bash
git clone https://github.com/md-abdullah-92/Eduverse.git
cd Eduverse
```

---

### 2. Set Environment Variables

Create `.env` files for each service and configure the following:

```env
DB_URL=
JWT_SECRET=
FIREBASE_API_KEY=
STRIPE_SECRET=
```

---

### 3. Install Dependencies

#### 🖥️ Frontend

```bash
cd frontend
npm install
npm run dev
```

#### 🛠️ Backend Microservices

For each service (e.g., `user-service`, `course-service`, etc.):

```bash
cd services/<service-name>
npm install
npm run dev
```

Repeat for all backend services.

---

## ▶️ Usage

Once the frontend and backend services are up and running, open the platform in your browser:

```
http://localhost:3000
```

- 📝 Sign up as a student or course creator
- 📚 Create or enroll in courses (currently limited functionality)
- 💬 Use chat and progress tracking (features in progress)

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. Fork the repository
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your feature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Open a Pull Request

Please refer to our `CONTRIBUTING.md` for more details.

---


## 📬 Contact

For questions, suggestions, or feedback:

📧 Email: [abdullah92@student.sust.edu](mailto:abdullah92@student.sust.edu)  
📂 GitHub Issues: [Open an Issue](https://github.com/md-abdullah-92/Eduverse/issues)
