"use client";
import { dmSerif, poppins } from "@/utils/font";
import {
  BookOpen,
  ClipboardEditIcon,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Megaphone,
  Package,
  PieChart,
  Save,
  Star,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LogoutModal from "./LogoutModal";
import SidebarItem from "./SidebarItem";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: User, label: "Update Profile" },
  { icon: BookOpen, label: "My Courses" },
  { icon: Package, label: "Create Course" },
  {
    icon: Save,
    label: "Study Note",
    children: [
      { label: "Generate Study Notes" },
      { label: "Saved Study Notes" },
    ],
  },

  {
    icon: ClipboardEditIcon,
    label: "Short Questions",
    children: [
      { label: "Generate Short Questions" },
      { label: "Saved Questions" },
    ],
  },
  {
    icon: Lightbulb,
    label: "Quiz",
    children: [{ label: "Create Quiz" }, { label: "Saved Quizzes" }],
  },
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
      case "Generate Short Questions":
        return router.push(`/teachers/${userId}/assignments/generate`);
      case "Saved Questions":
        return router.push(`/teachers/${userId}/assignments/saved-assignments`);
      case "Generate Study Notes":
        return router.push(
          `/teachers/${userId}/study-notes/generate-study-notes`
        );
      case "Saved Study Notes":
        return router.push(`/teachers/${userId}/study-notes/saved-study-notes`);
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
        className={`w-72 h-screen fixed top-0 left-0 bg-white backdrop-blur-xl border-r border-gray-200/50 px-6 py-8 space-y-8 shadow-lg z-20 ${poppins.className}`}
      >
        <div className="h-7" />
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

        <nav className="space-y-1.5">
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
