"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { raleway, jaro } from "@/utils/font"; // Assuming these are font imports
import { AxiosError } from "axios";



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
      alert("Email not available!");
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = { email, password };

    try {
      if (activeTab === "login") {
        const res = await fetch(`http://localhost:5000/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.token || !data.user) {
          setMessage(data.message || "Login failed");
          throw new Error(data.message || "Login failed");
        }
        localStorage.setItem("token", data.token);
        const userId = data.user.id;
        const role = data.user.role;
        if (!userId || !role) {
          setMessage("Missing user information in response.");
          throw new Error("Missing user information in response.");
        }
        setMessage("Login successful! Redirecting...");
        if (role === "TEACHER") {
         window.location.href = `/teachers/${userId}`;

        } else if (role === "STUDENT") {
          window.location.href = `/students/${userId}`;
        } else {
          setMessage("Unknown user role. Please contact support.");
        }
      }
       else {
        const registrationPayload = {
          name:fullName,
          email,
          password,
          role: isTutor ? "TEACHER" : "STUDENT",
        };

        const res = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registrationPayload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Registration failed");

        console.log("✅ Registered:", data);
        setMessage("OTP sent to your email!");
        handleRedirectToOTP(email);
        
      }
    }  catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      alert(err.response?.data?.message || "Registration failed!");
      console.error("Error verifying OTP:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F4C5C] px-4">
      <div className="flex w-full max-w-6xl transition-all duration-500 rounded-2xl shadow-2xl overflow-hidden bg-[#0F4C5C] text-white scale-100 hover:scale-[1.02]">
        {/* Branding */}
        <div className="w-1/2 p-10 flex flex-col justify-center items-center border-r border-white/20">
          <img
            src="/images/logo_w.png"
            alt="EduVerse Logo"
            className="w-56 h-56 object-contain mb-6"
          />
          <h1 className={`text-7xl font-extrabold tracking-wider ${jaro.className}`}>
            EduVerse
          </h1>
        </div>

        {/* Auth Panel */}
        <div className="w-1/2 p-10">
          {/* Tabs */}
          <div className="flex space-x-8 mb-8 border-b border-white/20 pb-2">
            <button
              onClick={() => handleTabChange("login")}
              className={`text-sm pb-1 transition border-b-2 ${
                activeTab === "login"
                  ? "text-white border-orange-400"
                  : "text-gray-400 border-transparent hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => handleTabChange("register")}
              className={`text-sm pb-1 transition border-b-2 ${
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
            <h2 className="text-2xl font-semibold">Welcome to EduVerse</h2>
            <p className="text-sm text-gray-300">
              {activeTab === "login"
                ? "Thank you for coming back!"
                : "Thank you for joining us!"}
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className="mb-4 text-sm text-center px-4 py-2 rounded bg-white/10 text-orange-300">
              {message}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className={`space-y-5 ${raleway.className}`}>
            {activeTab === "register" && (
              <div>
                <label htmlFor="fullname" className="block text-sm mb-1">
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
                  className="w-full px-4 py-2 bg-white/10 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm mb-1">
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
                className="w-full px-4 py-2 bg-white/10 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm mb-1">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={activeTab === "login" ? "current-password" : "new-password"}
                required
                className="w-full px-4 py-2 bg-white/10 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-9 right-4 text-white/70 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {activeTab === "login" ? (
              <>
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="accent-orange-400" />
                    Remember me
                  </label>
                  <a href="#" className="hover:underline text-gray-200">
                    Forgot Password?
                  </a>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-white text-[#0F4C5C] font-semibold rounded hover:bg-gray-100 transition"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4 text-sm text-gray-300">
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
                  className="w-full py-2 bg-orange-500 text-white font-semibold rounded hover:bg-orange-400 transition"
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
  );
}
