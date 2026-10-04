"use client";
import Navigation from "@/components/ui_elements/navigation";
import { jaro, poppins } from "@/utils/font";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Header = () => {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhoto, setUserPhoto] = useState("");
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const photo = localStorage.getItem("userPhoto");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    console.log("User ID:", userId);
    console.log("Role:", role);
    console.log("userPhoto", photo);

    setIsLoggedIn(!!token);
    setUserPhoto(photo || "/logo.png");
    setRole(role || "STUDENT");
    setUserId(userId || "");
  }, [pathname]);

  const isAuthPage = pathname === "/auth/login";

  const profileLink =
    role === "STUDENT"
      ? `/students/${userId}`
      : role === "TEACHER"
      ? `/teachers/${userId}`
      : "/";

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-6 sm:py-4 lg:px-8">
      {/* Logo */}
      <div className="flex min-w-0 items-center space-x-2">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo_t.png" alt="EduVerse Logo" className="h-8 w-auto shrink-0 sm:h-10" />
          <span
            className={`text-2xl font-bold text-sky-900 sm:text-3xl ${jaro.className}`}
          >
            EduVerse
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Right-side */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {isLoggedIn ? (
          <Link
            href={profileLink}
            className="text-gray-700 hover:text-gray-900"
          >
            <img
              src={userPhoto}
              alt="User Profile"
              className="size-9 cursor-pointer rounded-full border-2 border-sky-900 object-cover sm:size-10"
            />
          </Link>
        ) : (
          !isAuthPage && (
            <>
              <Link
                href="/auth/login?tab=login"
                className={`rounded-lg bg-[#1A5B6D] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#154C5B] sm:px-5 sm:text-base ${poppins.className}`}
              >
                Login
              </Link>
              <Link
                href="/auth/login?tab=register"
                className={`hidden rounded-lg bg-[#1A5B6D] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#154C5B] sm:inline-flex sm:px-5 sm:text-base ${poppins.className}`}
              >
                Get Started
              </Link>
            </>
          )
        )}
      </div>
    </header>
  );
};

export default Header;
