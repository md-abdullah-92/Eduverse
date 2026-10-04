"use client"; // if you're in a client component

import Link from "next/link";
import { usePathname } from "next/navigation"; // to get current path
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { poltawskiNowy } from "@/utils/font";
const Navigation = () => {
  const pathname = usePathname(); // e.g. "/about"
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const linkClasses = (path: string) =>
    `hover:text-sky-800 transition-colors ${
      pathname === path ? "text-sky-800 underline underline-offset-4" : ""
    }`;

  return (
    <nav
      className={`relative text-[18px] font-medium text-[#6A6B6C] ${poltawskiNowy.className}`}
      aria-label="Main navigation"
    >
      <div className="hidden items-center space-x-6 md:flex">
        <Link href="/" className={linkClasses("/")}>
          Home
        </Link>
        <Link href="/courses" className={linkClasses("/courses")}>
          Course
        </Link>
        <Link href="/mentors" className={linkClasses("/mentors")}>
          Mentors
        </Link>
        <Link href="/about" className={linkClasses("/about")}>
          About
        </Link>
      </div>

      <button
        type="button"
        className="inline-flex size-10 items-center justify-center rounded-md text-sky-900 hover:bg-sky-50 md:hidden"
        aria-label={isOpen ? "Close main menu" : "Open main menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-main-navigation"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {isOpen && (
        <div
          id="mobile-main-navigation"
          className="absolute right-0 top-full z-50 mt-3 flex min-w-48 flex-col gap-1 rounded-md border border-gray-200 bg-white p-2 text-base shadow-lg md:hidden"
        >
          <Link href="/" className={`rounded px-3 py-2 hover:bg-sky-50 ${linkClasses("/")}`}>
            Home
          </Link>
          <Link href="/courses" className={`rounded px-3 py-2 hover:bg-sky-50 ${linkClasses("/courses")}`}>
            Course
          </Link>
          <Link href="/mentors" className={`rounded px-3 py-2 hover:bg-sky-50 ${linkClasses("/mentors")}`}>
            Mentors
          </Link>
          <Link href="/about" className={`rounded px-3 py-2 hover:bg-sky-50 ${linkClasses("/about")}`}>
            About
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
