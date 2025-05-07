"use client";

import {
  LayoutDashboard,
  User,
  BookOpen,
  Package,
  Heart,
  Star,
  ListChecks,
  History,
  MessageSquare,
  Users,
  DollarSign,
  ClipboardList,
  LogOut,
  BadgeCheck,
  Megaphone,
  FileText,
  PieChart,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";

// Types
type MenuItem = {
  icon: React.ElementType;
  label: string;
};

type StatCardProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
};

type ChartCardProps = {
  title: string;
};

type SocialIconProps = {
  name: string;
};

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
};

// Menu Data
const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: User, label: "Update Profile" },
  { icon: BookOpen, label: "Enrolled Courses" },
  { icon: Package, label: "Package" },
  { icon: Heart, label: "Wishlist" },
  { icon: Star, label: "Reviews" },
  { icon: ListChecks, label: "My Quiz Attempts" },
  { icon: History, label: "Order History" },
  { icon: MessageSquare, label: "Q&A" },
];

const instructorItems: MenuItem[] = [
  { icon: BookOpen, label: "My Courses" },
  { icon: Package, label: "My Package" },
  { icon: Megaphone, label: "Announcements" },
  { icon: DollarSign, label: "Withdrawals" },
  { icon: ListChecks, label: "Quiz Attempts" },
  { icon: FileText, label: "Assignments" },
  { icon: BadgeCheck, label: "Certificates" },
  { icon: PieChart, label: "Analytics" },
  { icon: LogOut, label: "Logout" },
];

// Sidebar Components
const SidebarItem = ({ icon: Icon, label, onClick }: SidebarItemProps) => (
  <div
    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
    onClick={onClick}
  >
    <Icon size={18} className="text-yellow-500" />
    <span>{label}</span>
  </div>
);

const LogoutModal = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Confirm Logout</h2>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to log out of EduVerse?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ role, userId }: { role: string; userId: string }) => {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleClick = (label: string) => {
    if (label === "Logout") {
      setShowLogoutModal(true);
      return;
    }

    if (label === "Update Profile") {
      router.push(role === "TEACHER" ? `/updatementors-profile/${userId}` : `/update-profile/${userId}`);
      return;
    }

    // Add more routes here
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <>
      <aside className="w-72 h-full bg-white border-r px-5 py-6 space-y-4">
        <nav className="space-y-1">
          {menuItems.map((item, i) => (
            <SidebarItem key={i} icon={item.icon} label={item.label} onClick={() => handleClick(item.label)} />
          ))}
        </nav>
        <h4 className="text-xs uppercase text-gray-400 mt-6">Instructor</h4>
        <nav className="space-y-1">
          {instructorItems.map((item, i) => (
            <SidebarItem key={i} icon={item.icon} label={item.label} onClick={() => handleClick(item.label)} />
          ))}
        </nav>
      </aside>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={confirmLogout} />
    </>
  );
};

// Reusable UI
const StatCard = ({ label, value, icon, color }: StatCardProps) => (
  <div className="bg-white p-4 rounded-xl shadow flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
    <div className={`text-2xl ${color}`}>{icon}</div>
  </div>
);

const ChartCard = ({ title }: ChartCardProps) => (
  <div className="bg-white rounded-xl p-4 shadow">
    <div className="flex justify-between items-center mb-2">
      <h4 className="font-semibold text-gray-800">{title}</h4>
      <select className="text-sm text-gray-500 border border-gray-300 rounded px-2 py-1">
        <option>This week</option>
        <option>This month</option>
      </select>
    </div>
    <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
      Chart Placeholder
    </div>
  </div>
);

const SocialIcon = ({ name }: SocialIconProps) => (
  <div className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 cursor-pointer">
    <Image src={`/icons/${name}.svg`} alt={name} width={16} height={16} className="object-contain" />
  </div>
);

// Dashboard Page
const DashboardPage = () => {
  const params = useParams();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      notFound();
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/profile/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        if (!data.teacherProfile) notFound();
        setProfile(data.teacherProfile);
      } catch {
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!profile) return null;

  const mentor = profile;
  const userInfo = mentor.user || {};
  const role = userInfo.role || "STUDENT";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} userId={userId} />
      <main className="flex-1 p-6 space-y-6">
        <div className="relative w-full h-64 md:h-80 lg:h-[400px] rounded-xl overflow-hidden">
          <Image
            src={mentor.coverPhoto || "/images/course1.png"}
            alt="Cover Photo"
            fill
            className="object-cover"
          />
          <div className="absolute bottom-4 right-6">
            <button className="text-sm text-white bg-black/50 backdrop-blur px-4 py-1.5 rounded hover:bg-black/70">
              Edit Cover Photo
            </button>
          </div>
        </div>

        <div className="relative -mt-20 pl-6 flex items-end gap-6">
          <Image
            src={mentor.profilePhoto || "/images/team/minhaz.jpg"}
            alt="Profile"
            width={160}
            height={160}
            className="rounded-full border-4 border-white shadow-lg"
          />
          <div className="flex-1 flex justify-between items-center pr-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{userInfo.name || "Mentor Name"}</h2>
              <p className="text-sm text-gray-500">⭐ {mentor.rating || "-"} ({mentor.totalReviews || 0})</p>
            </div>
            <div className="flex space-x-2">
              <SocialIcon name="facebook" />
              <SocialIcon name="tiktok" />
              <SocialIcon name="youtube" />
              <SocialIcon name="mail" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Total Students" value={mentor.totalStudents?.toString() || "-"} icon={<Users />} color="text-blue-500" />
          <StatCard label="Total Sales" value={mentor.totalSales ? `$${mentor.totalSales}` : "-"} icon={<DollarSign />} color="text-green-500" />
          <StatCard label="Total Courses" value={mentor.totalCourses?.toString() || "-"} icon={<BookOpen />} color="text-cyan-500" />
          <StatCard label="Processing Orders" value={mentor.processingOrders?.toString() || "-"} icon={<ClipboardList />} color="text-purple-500" />
          <StatCard label="Completed Orders" value={mentor.completedOrders?.toString() || "-"} icon={<ClipboardList />} color="text-pink-500" />
          <StatCard label="Total Orders" value={mentor.totalOrders?.toString() || "-"} icon={<ClipboardList />} color="text-orange-500" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <ChartCard title="Students" />
          <ChartCard title="Net Sales" />
        </div>

        <div className="bg-white rounded-xl p-6 shadow space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Best Selling Course</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <Image src="/course-thumbnail.jpg" alt="Course" width={300} height={200} className="rounded-lg" />
            <div className="space-y-1">
              <h4 className="text-gray-800 font-semibold text-lg">How to Budget and Forecast for Your Business</h4>
              <p className="text-sm text-gray-500">4 Lessons · 1,200 Students · 3 Weeks</p>
              <div className="flex items-center space-x-2">
                <p className="text-red-500 text-lg font-bold">$20.0</p>
                <p className="text-sm text-gray-400 line-through">$29.0</p>
              </div>
              <p className="text-sm text-green-600">1,210 Courses Sold · $42,350.0 Net Sales</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
