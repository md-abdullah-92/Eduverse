"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarLink = {
  href: string;
  label: string;
  icon?: string;
};

type SidebarProps = {
  role: "STUDENT" | "TEACHER" | "ADMIN";
};

export const Sidebar = ({ role }: SidebarProps) => {
  const pathname = usePathname();
  const userId = pathname.split("/")[2];

  const links: Record<string, SidebarLink[]> = {
    STUDENT: [
      { href: "/dashboard/students", label: "Dashboard" },
      {
        href: `/students/${userId}/enrolled_course`,
        label: "My Courses",
      },
      { href: "/certificates", label: "Certificates" },
    ],
    TEACHER: [
      { href: `/dashboard/teachers/${userId}`, label: "Dashboard" },
      { href: "/dashboard/teachers/create-course", label: "Create Course" },
      { href: "/dashboard/teachers/courses", label: "My Courses" },
    ],
    ADMIN: [
      { href: "/dashboard/admin", label: "Dashboard" },
      { href: "/dashboard/admin/users", label: "Users" },
      { href: "/dashboard/admin/courses", label: "Courses" },
    ],
  };

  const currentLinks = links[role] || [];

  return (
    <aside className="bg-white w-64 min-h-screen border-r border-gray-200 py-6">
      <nav className="space-y-1 px-4">
        {currentLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-2 rounded-md ${
              pathname === link.href
                ? "bg-sky-50 text-sky-900"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
