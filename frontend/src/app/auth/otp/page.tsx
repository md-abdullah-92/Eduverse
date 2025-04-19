"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { raleway, jaro } from "@/utils/font";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";


export default function OtpVerification() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [email, setEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");
    if (!email) {
      return alert("Email is missing from URL!");
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/verify-email", {
        email,
        otp: finalOtp.toString(),
      });
      alert(res.data.message);
      router.push("auth/login?tab=login");
      console.log(res.data.user);
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      alert(err.response?.data?.message || "Verification failed!");
      console.error("Error verifying OTP:", err);
    }
  };

  const handleResend = async () => {
    if (!email) return alert("Email is missing!");
    setIsResending(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/resend-otp", { email });
      alert(res.data.message || "OTP resent successfully!");
      setResendCooldown(300); // Cooldown for 60 seconds
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      alert(err.response?.data?.message || "Failed to resend OTP.");
      console.error("Error resending OTP:", err);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F4C5C] px-4">
      <div className="flex w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-[#0F4C5C] text-white">
        {/* Branding */}
        <div className="w-1/2 p-10 flex flex-col justify-center items-center border-r border-white/20">
          <img src="/images/logo_w.png" alt="EduVerse Logo" className="w-44 h-44 object-contain mb-6" />
          <h1 className={`text-6xl font-extrabold tracking-wider ${jaro.className}`}>EduVerse</h1>
        </div>

        {/* OTP Section */}
        <div className="w-1/2 p-10">
          <h2 className={`text-3xl font-semibold mb-4 ${raleway.className}`}>OTP Verification</h2>
          <p className="text-gray-300 mb-6 text-sm">
            Enter the 6-digit code sent to <span className="text-orange-300">{email || "your email"}</span>.
          </p>

          <div className="flex gap-3 justify-center mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center text-2xl font-semibold bg-white/10 text-white rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            className="w-full py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded transition"
          >
            VERIFY OTP
          </button>

          <p className="mt-4 text-sm text-gray-300 text-center">
            Didn’t receive the code?{" "}
            <button
              onClick={handleResend}
              disabled={isResending || resendCooldown > 0}
              className={`underline ${
                isResending || resendCooldown > 0 ? "text-gray-500 cursor-not-allowed" : "text-orange-400"
              }`}
            >
              {isResending
                ? "Resending..."
                : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
