"use client"; // if you're in a client component

import Link from "next/link";
import { usePathname } from "next/navigation"; // to get current path
import { poltawskiNowy } from "@/utils/font";
const Navigation = () => {
  const pathname = usePathname(); // e.g. "/about"

  const linkClasses = (path: string) =>
    `hover:text-sky-800 transition-colors ${
      pathname === path ? "text-sky-800 underline underline-offset-4" : ""
    }`;

  return (
    <nav
      className={`hidden md:flex items-center space-x-6 text-[18px] font-medium text-[#6A6B6C] ${poltawskiNowy.className}`}
    >
      <Link href="/" className={linkClasses("/")}>
        Home
      </Link>
      <Link href="/courses" className={linkClasses("/courses")}>
        Course
      </Link>
      <Link href="/monitors" className={linkClasses("/monitors")}>
        Monitors
      </Link>
      <Link href="/about" className={linkClasses("/about")}>
        About
      </Link>
    </nav>
  );
};

export default Navigation;
