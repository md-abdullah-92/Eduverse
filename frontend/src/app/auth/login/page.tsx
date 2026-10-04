"use client";

import { API_URLS } from "@/lib/api/urls";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { raleway, jaro } from "@/utils/font"; // Assuming these are font imports
import { AxiosError } from "axios";
import Footer from "@/components/layout/footer"; // Adjust the import path as needed
import { ToastContext } from "@/components/ui_elements/toast";

const USER_API_URL = process.env.NEXT_PUBLIC_USER_API_URL || `${API_URLS.user}`;
import { useContext } from "react";

export default function LoginRegister() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isTutor, setIsTutor] = useState(false);
  const searchParams = useSearchParams();

  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { showToast } = useContext(ToastContext); // 👈 use toast context

  useEffect(() => {
    const tab = searchParams.get("tab");
    setActiveTab(tab === "register" ? "register" : "login");
  }, [searchParams]);

  const handleTabChange = (tab: "login" | "register") => {
    setMessage("");
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    router.push(`?${params.toString()}`);
  };
  const handleRedirectToOTP = (email: string) => {
    if (email) {
      router.push(`/auth/otp?email=${encodeURIComponent(email)}`);
    } else {
      showToast("Email not available!", "error");
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = { email, password };

    try {
      if (activeTab === "login") {
        const res = await fetch(`${USER_API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || !data.token || !data.user) {
          const msg = data.message || "Login failed";
          showToast(msg, "error");
          throw new Error(msg);
        }

        localStorage.setItem("token", data.token);
        const userId = data.user.id;
        const role = data.user.role;

        if (!userId || !role) {
          const msg = "Missing user information in response.";
          showToast(msg, "error");
          throw new Error(msg);
        }

        showToast("Login successful! Redirecting...", "success");

        if (role === "TEACHER") {
          window.location.href = `/teachers/${userId}`;
        } else if (role === "STUDENT") {
          window.location.href = `/students/${userId}`;
        } else {
          showToast("Unknown user role. Please contact support.", "error");
        }
      } else {
        const registrationPayload = {
          name: fullName,
          email,
          password,
          role: isTutor ? "TEACHER" : "STUDENT",
        };

        const res = await fetch(`${USER_API_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registrationPayload),
        });

        const data = await res.json();

        if (!res.ok) {
          const msg = data.message || "Registration failed";
          showToast(msg, "error");
          throw new Error(msg);
        }

        showToast("OTP sent to your email!", "success");
        handleRedirectToOTP(email);
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      const fallbackMessage =
        activeTab === "login" ? "Login failed!" : "Registration failed!";
      const errorMsg = err.response?.data?.message || fallbackMessage;

      showToast(errorMsg, "error");
      console.error("Error during auth:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-[#0F4C5C] px-3 pb-6 pt-10 sm:px-4 sm:pt-12 lg:px-6 lg:pt-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-[#0F4C5C] text-white shadow-2xl transition-all duration-500 lg:flex-row lg:hover:scale-[1.01]">
          {/* Branding */}
          <div className="flex w-full flex-col items-center justify-center border-b border-white/20 p-6 text-center sm:p-8 lg:w-1/2 lg:border-r lg:border-b-0 lg:p-10">
            <img
              src="/images/logo_w.png"
              alt="EduVerse Logo"
              className="mb-6 h-24 w-24 object-contain sm:h-32 sm:w-32 lg:h-56 lg:w-56"
            />
            <h1
              className={`text-4xl font-extrabold tracking-wider sm:text-5xl lg:text-7xl ${jaro.className}`}
            >
              EduVerse
            </h1>
          </div>

          {/* Auth Panel */}
          <div className="w-full p-5 sm:p-8 lg:w-1/2 lg:p-10">
            {/* Tabs */}
            <div className="mb-8 flex gap-4 border-b border-white/20 pb-2 sm:gap-8">
              <button
                onClick={() => handleTabChange("login")}
                className={`pb-1 text-sm transition border-b-2 ${
                  activeTab === "login"
                    ? "text-white border-orange-400"
                    : "text-gray-400 border-transparent hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => handleTabChange("register")}
                className={`pb-1 text-sm transition border-b-2 ${
                  activeTab === "register"
                    ? "text-white border-orange-400"
                    : "text-gray-400 border-transparent hover:text-white"
                }`}
              >
                Registration
              </button>
            </div>

            {/* Greeting */}
            <div className={`mb-6 ${raleway.className}`}>
              <h2 className="text-xl font-semibold sm:text-2xl">
                Welcome to EduVerse
              </h2>
              <p className="text-sm text-gray-300">
                {activeTab === "login"
                  ? "Thank you for coming back!"
                  : "Thank you for joining us!"}
              </p>
            </div>

            {/* Message */}
            {message && (
              <div className="mb-4 rounded bg-white/10 px-4 py-2 text-center text-sm text-orange-300">
                {message}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className={`space-y-5 ${raleway.className}`}
            >
              {activeTab === "register" && (
                <div>
                  <label htmlFor="fullname" className="mb-1 block text-sm">
                    Full Name
                  </label>
                  <input
                    id="fullname"
                    type="text"
                    placeholder="Your Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                    className="w-full rounded bg-white/10 px-4 py-2.5 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-1 block text-sm">
                  Your Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full rounded bg-white/10 px-4 py-2.5 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="mb-1 block text-sm">
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={
                    activeTab === "login" ? "current-password" : "new-password"
                  }
                  required
                  className="w-full rounded bg-white/10 px-4 py-2.5 pr-11 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-9 text-white/70 transition hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {activeTab === "login" ? (
                <>
                  <div className="flex flex-col gap-3 text-sm text-gray-300 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="accent-orange-400" />
                      Remember me
                    </label>
                    <a href="#" className="text-gray-200 hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-white py-2.5 font-semibold text-[#0F4C5C] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-3 text-sm text-gray-300 sm:flex-row sm:items-center sm:gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="role"
                        value="STUDENT"
                        checked={!isTutor}
                        onChange={() => setIsTutor(false)}
                      />
                      Register as Student
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="role"
                        value="TEACHER"
                        checked={isTutor}
                        onChange={() => setIsTutor(true)}
                      />
                      Register as Tutor
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-orange-500 py-2.5 font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading
                      ? "Registering..."
                      : isTutor
                      ? "Register as Tutor"
                      : "Register as Student"}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
