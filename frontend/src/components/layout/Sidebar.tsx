"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarLink = {
  href: string;
  label: string;
  icon: string;
};

type SidebarProps = {
  role: "STUDENT" | "TEACHER" | "ADMIN";
};

export const Sidebar = ({ role }: SidebarProps) => {
  const pathname = usePathname();
  const userId = pathname.split("/")[2];

  const links: Record<string, SidebarLink[]> = {
    STUDENT: [
      {
        href: "/dashboard/students",
        label: "Dashboard",
        icon: "🏠",
      },
      {
        href: `/students/${userId}/enrolled_course`,
        label: "My Courses",
        icon: "📚",
      },
      {
        href: "/certificates",
        label: "Certificates",
        icon: "🏆",
      },
    ],
    TEACHER: [
      {
        href: `/dashboard/teachers/${userId}`,
        label: "Dashboard",
        icon: "📊",
      },
      {
        href: "/dashboard/teachers/create-course",
        label: "Create Course",
        icon: "➕",
      },
      {
        href: "/dashboard/teachers/courses",
        label: "My Courses",
        icon: "📖",
      },
    ],
    ADMIN: [
      {
        href: "/dashboard/admin",
        label: "Dashboard",
        icon: "⚡",
      },
      {
        href: "/dashboard/admin/users",
        label: "Users",
        icon: "👥",
      },
      {
        href: "/dashboard/admin/courses",
        label: "Courses",
        icon: "🎓",
      },
    ],
  };

  const currentLinks = links[role] || [];

  const getRoleTheme = (role: string) => {
    switch (role) {
      case "STUDENT":
        return {
          primary: "from-blue-600 to-indigo-700",
          secondary: "bg-blue-50",
          text: "text-blue-600",
          accent: "bg-blue-500",
          emoji: "🎓",
        };
      case "TEACHER":
        return {
          primary: "from-emerald-600 to-teal-700",
          secondary: "bg-emerald-50",
          text: "text-emerald-600",
          accent: "bg-emerald-500",
          emoji: "👨‍🏫",
        };
      case "ADMIN":
        return {
          primary: "from-purple-600 to-pink-700",
          secondary: "bg-purple-50",
          text: "text-purple-600",
          accent: "bg-purple-500",
          emoji: "👑",
        };
      default:
        return {
          primary: "from-gray-600 to-gray-700",
          secondary: "bg-gray-50",
          text: "text-gray-600",
          accent: "bg-gray-500",
          emoji: "⚙️",
        };
    }
  };

  const theme = getRoleTheme(role);

  return (
    <aside className="w-72 min-h-screen bg-gray-900 text-white flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div
            className={`w-12 h-12 bg-gradient-to-br ${theme.primary} rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300`}
          >
            <span className="text-2xl">{theme.emoji}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              EduPortal
            </h1>
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${theme.primary} shadow-lg`}
            >
              <span className="mr-1">{theme.emoji}</span>
              {role}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 px-4 py-6 space-y-2">
        {currentLinks.map((link, index) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group relative flex items-center px-4 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                isActive
                  ? "bg-white text-gray-900 shadow-2xl"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div
                  className={`absolute left-0 w-1 h-8 bg-gradient-to-b ${theme.primary} rounded-r-full`}
                ></div>
              )}

              {/* Icon */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-xl mr-4 transition-all duration-300 transform ${
                  isActive
                    ? `bg-gradient-to-br ${theme.primary} text-white shadow-lg scale-110`
                    : "bg-gray-800 group-hover:bg-gray-700 group-hover:scale-110"
                }`}
              >
                <span
                  className={`text-lg transition-transform duration-300 ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`}
                >
                  {link.icon}
                </span>
              </div>

              {/* Label */}
              <span
                className={`font-medium ${isActive ? "font-semibold" : ""}`}
              >
                {link.label}
              </span>

              {/* Arrow indicator for active */}
              {isActive && (
                <div className="ml-auto">
                  <div
                    className={`w-2 h-2 bg-gradient-to-br ${theme.primary} rounded-full animate-pulse`}
                  ></div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Card */}
      <div className="relative z-10 p-4">
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 hover:border-gray-600 transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 bg-gradient-to-br ${theme.primary} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}
            >
              U
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">User Profile</h3>
              <p className="text-sm text-gray-400">{role.toLowerCase()}</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Decorative bottom element */}
      <div className={`h-2 bg-gradient-to-r ${theme.primary}`}></div>
    </aside>
  );
};
