"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { raleway, jaro } from "@/utils/font";

export default function LoginRegister() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Update tab from URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "register") setActiveTab("register");
    else setActiveTab("login");
  }, [searchParams]);

  // Sync tab click with URL
  const handleTabChange = (tab: "login" | "register") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    router.push(`?${params.toString()}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle login/register logic
    console.log("Submitted form for:", activeTab);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F4C5C] px-4">
      <div className="flex w-full max-w-6xl transition-all duration-500 rounded-2xl shadow-2xl overflow-hidden bg-[#0F4C5C] text-white scale-100 hover:scale-[1.02]">
        {/* Branding Section */}
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

        {/* Auth Section */}
        <div className="w-1/2 p-10 bg-[#0F4C5C] transition-all duration-300 ease-in-out">
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
                  autoComplete="name"
                  className="w-full px-4 py-2 bg-white/10 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                  defaultValue="Techy Ahad"
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
                autoComplete="email"
                className="w-full px-4 py-2 bg-white/10 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                defaultValue="techyahadpersonal@gmail.com"
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
                autoComplete={activeTab === "login" ? "current-password" : "new-password"}
                className="w-full px-4 py-2 bg-white/10 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                defaultValue="password123"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-9 right-4 text-white/70 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Footer Buttons */}
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
                  className="w-full py-2 bg-white text-[#0F4C5C] font-semibold rounded hover:bg-gray-100 transition"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                <button
                  type="submit"
                  className="w-full py-2 bg-white text-[#0F4C5C] font-semibold rounded hover:bg-gray-100 transition"
                >
                  REGISTER AS STUDENT
                </button>
                <button
                  type="submit"
                  className="w-full py-2 bg-orange-500 text-white font-semibold rounded hover:bg-orange-400 transition"
                >
                  REGISTER AS TUTOR
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
