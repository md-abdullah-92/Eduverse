"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardEditIcon,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Package,
  Save,
  Star,
  User,
  BadgeCheck,
  ShoppingCart,
  ListChecks,
} from "lucide-react";
import { dmSerif, poppins } from "@/utils/font";
import SidebarItem from "@/components/Common-Components/SidebarItem";
import LogoutModal from "@/components/Common-Components/LogoutModal";
import type { MenuItem } from "@/types/ui";

const Sidebar = ({ role, userId }: { role: string; userId: string }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState<string | null>(null);
  const [enrolledCount, setEnrolledCount] = useState(0);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const enrolled_course = localStorage.getItem("totalEnrolledCourses");
    setEnrolledCount(enrolled_course ? parseInt(enrolled_course) : 0);
  }, []);

  const handleClick = async (label: string) => {
    if (loadingLabel) return;
    setLoadingLabel(label);

    const go = (path: string) => {
      if (pathname !== path) {
        router.push(path);
      } else {
        setLoadingLabel(null); // Avoid infinite loading
      }
    };

    switch (label) {
      case "Logout":
        setShowLogoutModal(true);
        setLoadingLabel(null);
        return;
      case "Dashboard":
        return go(`/${role === "TEACHER" ? "teachers" : "students"}/${userId}`);
      case "Update Profile":
        return go(
          role === "TEACHER"
            ? `/updatementors-profile/${userId}`
            : `/updatestudents-profile/${userId}`
        );
      case "My Courses":
        return go(`/teachers/${userId}/all/`);
      case "Create Course":
        return go(`/teachers/${userId}/create_course/`);
      case "Generate Short Questions":
        return go(`/teachers/${userId}/assignments/generate`);
      case "Saved Questions":
        return go(`/teachers/${userId}/assignments/saved-assignments`);
      case "Generate Study Notes":
        return go(`/teachers/${userId}/study-notes/generate-study-notes`);
      case "Saved Study Notes":
        return go(`/teachers/${userId}/study-notes/saved-study-notes`);
      case "Create Quiz":
        return go(`/teachers/${userId}/quiz/manage/`);
      case "Saved Quizzes":
        return go(`/teachers/${userId}/quiz/Saved/`);
      
      case "Enrolled Courses":
        return go(`/students/${userId}/enrolled_course`);
      case "Quiz Attempts":
        return go(`/students/${userId}/quiz/quizattempts`);
      case "Certificates":
        return go(`/students/${userId}/certificates`);
      case "Cart":
        return go(`/cart`);
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

  const teacherMenu: MenuItem[] = [
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
      children: [
        { label: "Create Quiz" },
        { label: "Saved Quizzes" },
      ],
    },
    
    { icon: LogOut, label: "Logout" },
  ];

  const studentMenu: MenuItem[] = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: User, label: "Update Profile" },
    { icon: BookOpen, label: "Enrolled Courses", badge: enrolledCount },
    { icon: ListChecks, label: "Quiz Attempts" },
    { icon: BadgeCheck, label: "Certificates" },
    { icon: ShoppingCart, label: "Cart" },
    { icon: LogOut, label: "Logout" },
  ];

  const menuItems = role === "TEACHER" ? teacherMenu : studentMenu;

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
            {role === "TEACHER" ? "Teacher Portal" : "Student Portal"}
          </h1>
        </div>

        <nav className="space-y-1">
          {menuItems.map(({ icon, label, children, badge }) => (
            <SidebarItem
              key={label}
              icon={icon}
              label={label}
              subItems={children}
              badge={badge}
              onClick={handleClick}
              isActive={loadingLabel === label}
              loadingLabel={loadingLabel ?? ""}
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
