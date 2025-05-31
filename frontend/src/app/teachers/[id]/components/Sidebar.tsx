"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  LogOut,
  ClipboardEdit,
  DollarSign,
  FileText,
  Megaphone,
  Package,
  PieChart,
  Star,
  User,
  
  
} from "lucide-react";
import SidebarItem from "./SidebarItem"; // assume SidebarItem is also a separate file
import LogoutModal from "./LogoutModal"; // same here if modularized

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: User, label: "Update Profile" },
  { icon: BookOpen, label: "My Courses" },
  { icon: Package, label: "Create Course" },
  { icon: ClipboardEdit, label: "Create Quiz" },
  { icon: Megaphone, label: "Announcements" },
  { icon: DollarSign, label: "Withdrawals" },
  { icon: FileText, label: "Assignments" },
  { icon: PieChart, label: "Analytics" },
  { icon: Star, label: "Reviews" },
  { icon: LogOut, label: "Logout" },
];

const Sidebar = ({ role, userId }: { role: string; userId: string }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();
  
  const handleClick = (label: string) => {
    if (label === "Dashboard") return router.push(`/teachers/${userId}`);
    if (label === "Logout") return setShowLogoutModal(true);
    if (label === "Update Profile")
      return router.push(
        role === "TEACHER"
          ? `/updatementors-profile/${userId}`
          : `/update-profile/${userId}`
      );
    if (label === "Create Quiz") return router.push(`/teachers/${userId}/quiz/create/`);
    if (label === "My Courses")
      return router.push(
        role === "TEACHER"
          ? `/teachers/${userId}/all/`
          : `/students/${userId}/enrolled_course`
      );
    if (label === "Create Course" && role === "TEACHER")
      return router.push(`/teachers/${userId}/create_course/`);
  };

  const confirmLogout = () => {
    [
      "token",
      "userPhoto",
      "userName",
      "userId",
      "role",
      "userEmail",
      "userPhone",
      "userBio",
      "userCoverPhoto",
    ].forEach((key) => localStorage.removeItem(key));
    setShowLogoutModal(false);
    window.location.href = "/";
  };

  return (
    <>
      <aside className="w-80 h-full bg-white/80 backdrop-blur-xl border-r border-gray-200/50 px-6 py-8 space-y-8 shadow-lg">
        <div className="flex items-center space-x-3 pb-6 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
              EduVerse
            </h1>
            <p className="text-xs text-gray-500">Instructor Portal</p>
          </div>
        </div>

        <nav className="space-y-6">
          {menuItems.map((item, i) => (
            <SidebarItem
              key={i}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
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
