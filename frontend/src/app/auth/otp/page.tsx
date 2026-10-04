"use client";

import { API_URLS } from "@/lib/api/urls";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { raleway, jaro } from "@/utils/font";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import Footer from "@/components/layout/footer";
import Image from "next/image";

import { useContext } from "react";
import { ToastContext } from "@/components/ui_elements/toast"; // adjust path as needed

const USER_API_URL = process.env.NEXT_PUBLIC_USER_API_URL || `${API_URLS.user}`;

export default function OtpVerification() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [email, setEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  const { showToast } = useContext(ToastContext); // ✅ Place at the top of your component

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

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");

    if (!email) {
      showToast("Email is missing from URL!", "error");
      return;
    }

    try {
      const res = await axios.post(
        `${USER_API_URL}/auth/verify-email`,
        {
          email,
          otp: finalOtp,
        }
      );

      showToast(res.data.message || "Verification successful!", "success");
      router.push("/auth/login?tab=login");
      console.log(res.data.user);
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      const errorMsg = err.response?.data?.message || "Verification failed!";
      showToast(errorMsg, "error");
      console.error("Error verifying OTP:", err);
    }
  };

  const handleResend = async () => {
    if (!email) {
      showToast("Email is missing!", "error");
      return;
    }

    setIsResending(true);
    try {
      const res = await axios.post(
        `${USER_API_URL}/auth/resend-otp`,
        {
          email,
        }
      );

      showToast(res.data.message || "OTP resent successfully!", "success");
      setResendCooldown(300); // Cooldown in seconds (5 minutes)
    } catch (error: unknown) {
      const err = error as AxiosError<{ message: string }>;
      const errorMsg = err.response?.data?.message || "Failed to resend OTP.";
      showToast(errorMsg, "error");
      console.error("Error resending OTP:", err);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div>
      <div className="flex min-h-screen items-center justify-center bg-[#0F4C5C] px-3 py-6 sm:px-4 sm:py-10">
        <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-[#0F4C5C] text-white shadow-2xl md:flex-row">
          {/* Branding */}
          <div className="flex w-full flex-col items-center justify-center border-b border-white/20 px-5 py-6 sm:px-10 sm:py-8 md:w-1/2 md:border-b-0 md:border-r md:p-10">
            <Image
              src="/images/logo_w.png"
              alt="EduVerse Logo"
              width={176}
              height={176}
              className="mb-3 h-24 w-24 object-contain sm:mb-6 sm:h-36 sm:w-36 md:h-44 md:w-44"
            />
            <h1
              className={`text-4xl font-extrabold sm:text-5xl md:text-6xl ${jaro.className}`}
            >
              EduVerse
            </h1>
          </div>

          {/* OTP Section */}
          <div className="w-full min-w-0 px-5 py-7 sm:px-10 sm:py-9 md:w-1/2 md:p-10">
            <h2 className={`mb-4 text-2xl font-semibold sm:text-3xl ${raleway.className}`}>
              OTP Verification
            </h2>
            <p className="mb-6 break-words text-sm text-gray-300">
              Enter the 6-digit code sent to{" "}
              <span className="text-orange-300">{email || "your email"}</span>.
            </p>

            <div className="mb-6 flex justify-center gap-2 sm:gap-3">
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
                  className="h-10 w-9 rounded bg-white/10 text-center text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-400 sm:h-12 sm:w-12 sm:text-2xl"
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
                  isResending || resendCooldown > 0
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-orange-400"
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
      {/* Footer */}
      <Footer />
    </div>
  );
}
