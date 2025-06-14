"use client";

import {
  BadgeCheck,
  BookOpen,
  LayoutDashboard,
  ListChecks,
  LogOut,
  ShoppingCart,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import LogoutModal from "./LogoutModel";
import SidebarItem from "./SidebarItem";
import { dmSerif, poppins } from "@/utils/font";

type NavigationItem = {
  icon: React.ElementType;
  label: string;
  badge?: number;
};

const Sidebar = ({ userId, role }: { userId: string; role: string }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const enrolled_course = localStorage.getItem("totalEnrolledCourses");
    setEnrolledCount(enrolled_course ? parseInt(enrolled_course) : 0);
  }, []);

  const studentNavigationItems: NavigationItem[] = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: User, label: "Update Profile" },
    { icon: BookOpen, label: "Enrolled Courses", badge: enrolledCount },
    { icon: ListChecks, label: "Quiz Attempts" },
    { icon: BadgeCheck, label: "Certificates" },
    { icon: ShoppingCart, label: "Cart" },
    { icon: LogOut, label: "Logout" },
  ];

  const handleClick = async (label: string) => {
    if (loadingItem) return; // Prevent multiple clicks
    setLoadingItem(label);

    if (label === "Logout") {
      setShowLogoutModal(true);
      setLoadingItem(null);
      return;
    }

    try {
      switch (label) {
        case "Dashboard":
          router.push(`/students/${userId}`);
          break;
        case "Update Profile":
          router.push(
            role === "TEACHER"
              ? `/updatementors-profile/${userId}`
              : `/updatestudents-profile/${userId}`
          );
          break;
        case "Enrolled Courses":
          router.push(`/students/${userId}/enrolled_course`);
          break;
        case "Quiz Attempts":
          router.push(`/students/${userId}/quiz/quizattempts`);
          break;
        case "Certificates":
          router.push(`/students/${userId}/certificates`);
          break;
        case "Cart":
          router.push("/cart");
          break;
        default:
          break;
      }
    } finally {
      setLoadingItem(null);
    }
  };

  const confirmLogout = () => {
    setLoadingItem("Logout");

    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userPhoto");
      localStorage.removeItem("role");
    }

    setShowLogoutModal(false);
    router.push("/");
  };

  return (
    <>
      <aside
        className={`w-72 h-screen fixed top-0 left-0 bg-white backdrop-blur-xl border-r border-gray-200/50 px-6 py-8 space-y-8 shadow-lg z-20 ${poppins.className}`}
      >
        <div className="h-7" />
        <div className="flex items-center space-x-3 pb-6 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1
            className={`text-xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent ${dmSerif.className}`}
          >
            Student Portal
          </h1>
        </div>

        <nav className="space-y-4">
          {studentNavigationItems.map(({ icon, label, badge }) => (
            <SidebarItem
              key={label}
              icon={icon}
              label={label}
              badge={badge}
              onClick={handleClick}
              isActive={loadingItem === label}
              loadingLabel={loadingItem ?? ""}
            />
          ))}
        </nav>
      </aside>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
};

export default Sidebar;
