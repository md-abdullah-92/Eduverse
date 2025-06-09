"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  BookOpen,
  Heart,
  ListChecks,
  FileText,
  BadgeCheck,
  ShoppingCart,
  LogOut,
} from "lucide-react";
import SidebarItem from "./SidebarItem";
import LogoutModal from "./LogoutModel";

// Fonts
import {
  poppins,
  dmSerif,
} from "@/utils/font"; // adjust import path if needed

type NavigationItem = {
  icon: React.ElementType;
  label: string;
  badge?: number;
};
const enrolled_course=localStorage.getItem("totalEnrolledCourses");

const studentNavigationItems: NavigationItem[] = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: User, label: "Update Profile" },
  { icon: BookOpen, label: "Enrolled Courses", badge: enrolled_course ? parseInt(enrolled_course) : 0 },
  { icon: Heart, label: "Wishlist", badge: 12 },
  { icon: ListChecks, label: "Quiz Attempts" },
  { icon: FileText, label: "Assignments", badge: 3 },
  { icon: BadgeCheck, label: "Certificates" },
  { icon: ShoppingCart, label: "Cart" },
  { icon: LogOut, label: "Logout" },
];

const Sidebar = ({
  userId,
  role,
}: {
  userId: string;
  role: string;
}) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeItem] = useState("");

  const router = useRouter();

  const handleClick = (label: string) => {

    if (label === "Logout") {
      setShowLogoutModal(true);
      return;
    }
    if(label === "Dashboard"){
      router.push(`/students/${userId}`);
      return;
    }

    if (label === "Update Profile") {
      router.push(
        role === "TEACHER"
          ? `/updatementors-profile/${userId}`
          : `/updatestudents-profile/${userId}`
      );
      return;
    }
  
    if (label === "Enrolled Courses") {
      router.push(`/students/${userId}/enrolled_course`);
      return;
    }
    
    if (label === "Cart") {
      router.push(`/cart/`);
      return;
    }
    if (label === "Logout") {
      setShowLogoutModal(true);
      return;
    }
  };
  const confirmLogout = () => {
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
        className={`w-80 h-screen fixed top-0 left-0 bg-white backdrop-blur-xl border-r border-gray-200/50 px-6 py-8 space-y-8 shadow-lg z-20 ${poppins.className}`}
      >
        <div className="h-16" />
        <div className="flex items-center space-x-3 pb-6 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1
              className={`text-xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent ${dmSerif.className}`}
            >
              Student Portal
            </h1>
          </div>
        </div>

        <nav className="space-y-4">
          {studentNavigationItems.map((item, i) => (
            <SidebarItem
              key={i}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              isActive={activeItem === item.label}
              onClick={() => handleClick(item.label)}
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
