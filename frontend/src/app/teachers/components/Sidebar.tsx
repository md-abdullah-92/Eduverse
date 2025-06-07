"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  LogOut,
  ClipboardEdit,
  Megaphone,
  Package,
  PieChart,
  Star,
  User,
  Save,
  ClipboardEditIcon,
} from "lucide-react";
import SidebarItem from "./SidebarItem";
import LogoutModal from "./LogoutModal";
import { poppins, dmSerif } from "@/utils/font";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: User, label: "Update Profile" },
  { icon: BookOpen, label: "My Courses" },
  { icon: Package, label: "Create Course" },
  { icon: Save, label: "Study Note Generator" },
  { icon: ClipboardEditIcon, label: "Create Assignment" },
  {
    icon: ClipboardEdit,
    label: "Quiz",
    children: [
      { label: "Create Quiz" },
      { label: "Saved Quizzes" },
    ],
  },
  { icon: Megaphone, label: "Announcements" },
  { icon: PieChart, label: "Analytics" },
  { icon: Star, label: "Reviews" },
  { icon: LogOut, label: "Logout" },
];

const Sidebar = ({ role, userId }: { role: string; userId: string }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  const handleClick = (label: string) => {
    switch (label) {
      case "Dashboard":
        return router.push(`/teachers/${userId}`);
      case "Logout":
        return setShowLogoutModal(true);
      case "Announcements":
        return router.push(`/teachers/${userId}/announcements`);
      case "Create Assignment":
        return router.push(`/teachers/${userId}/assignments/generate`);
      case "Study Note Generator":
        return router.push(`/teachers/${userId}/generate-study-notes`);
      case "Update Profile":
        return router.push(
          role === "TEACHER"
            ? `/updatementors-profile/${userId}`
            : `/update-profile/${userId}`
        );
      case "Create Quiz":
        return router.push(`/teachers/${userId}/quiz/manage/`);
      case "Saved Quizzes":
        return router.push(`/teachers/${userId}/quiz/Saved/`);
      case "My Courses":
        return router.push(
          role === "TEACHER"
            ? `/teachers/${userId}/all/`
            : `/students/${userId}/enrolled_course`
        );
      case "Create Course":
        if (role === "TEACHER")
          return router.push(`/teachers/${userId}/create_course/`);
        break;
      default:
        return;
    }
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
      <aside
        className={`w-80 h-screen fixed top-0 left-0 bg-white backdrop-blur-xl border-r border-gray-200/50 px-6 py-8 space-y-8 shadow-lg z-20 ${poppins.className}`}
      >
        <div className="h-14" />
        <div className="flex items-center space-x-3 pb-6 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1
              className={`text-xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent ${dmSerif.className}`}
            >
              Teacher Portal
            </h1>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map(({ icon, label, children }, i) => (
            <SidebarItem
              key={label}
              icon={icon}
              label={label}
              onClick={handleClick}
              children={children}
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
