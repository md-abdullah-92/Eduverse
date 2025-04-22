"use client";

import {
  LayoutDashboard,
  BookOpen,
  Heart,
  Star,
  ListChecks,
  History,
  BadgeCheck,
  ClipboardList,
  LogOut,
  FileText,
} from "lucide-react";
import Image from "next/image";
import React from "react";

type NavigationItem = {
  icon: React.ElementType;
  label: string;
};

type StatCardProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
};

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
};

// Navigation Items for Students
const studentNavigationItems: NavigationItem[] = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: BookOpen, label: "Enrolled Courses" },
  { icon: Heart, label: "Wishlist" },
  { icon: Star, label: "Reviews" },
  { icon: ListChecks, label: "Quiz Attempts" },
  { icon: FileText, label: "Assignments" },
  { icon: BadgeCheck, label: "Certificates" },
  { icon: History, label: "Order History" },
  { icon: LogOut, label: "Logout" },
];

// Sidebar Navigation
const Sidebar: React.FC = () => (
  <aside className="w-72 h-full bg-white border-r px-5 py-6">
    <nav className="space-y-2">
      {studentNavigationItems.map((item, index) => (
        <SidebarItem key={index} icon={item.icon} label={item.label} />
      ))}
    </nav>
  </aside>
);

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label }) => (
  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer text-sm text-gray-700">
    <Icon size={18} className="text-yellow-500" />
    <span>{label}</span>
  </div>
);

// Statistic Card Component
const StatCard: React.FC<StatCardProps> = ({ label, value, icon, colorClass }) => (
  <div className="bg-white p-4 rounded-xl shadow flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
    <div className={`text-2xl ${colorClass}`}>{icon}</div>
  </div>
);

// Student Dashboard
const StudentDashboard: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6">
        {/* Cover Section */}
        <div className="relative w-full h-64 rounded-xl overflow-hidden">
          <Image
            src="/images/course1.png"
            alt="Student Cover"
            fill
            className="object-cover"
          />
          <div className="absolute bottom-4 right-6">
            <button className="text-sm text-white bg-black/50 backdrop-blur px-4 py-1.5 rounded hover:bg-black/70">
              Edit Cover Photo
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="relative -mt-20 pl-6 flex items-end gap-6">
          <Image
            src="/images/team/apurbo.png"
            alt="Student Profile"
            width={160}
            height={160}
            className="rounded-full border-4 border-white shadow-lg"
          />
          <div className="flex-1 flex justify-between items-center pr-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Abdullah Apurbo</h2>
              <p className="text-sm text-gray-500">Student ID: SUST-CSE-2020</p>
            </div>
            <span className="text-sm text-gray-600">📘 Active Learner</span>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <StatCard label="Courses Enrolled" value="8" icon={<BookOpen />} colorClass="text-blue-500" />
          <StatCard label="Certificates Earned" value="4" icon={<BadgeCheck />} colorClass="text-green-500" />
          <StatCard label="Lessons Completed" value="120" icon={<ClipboardList />} colorClass="text-cyan-500" />
          <StatCard label="Quiz Attempts" value="45" icon={<ListChecks />} colorClass="text-purple-500" />
          <StatCard label="Orders Placed" value="3" icon={<History />} colorClass="text-orange-500" />
          <StatCard label="Reviews Given" value="7" icon={<Star />} colorClass="text-yellow-500" />
        </div>

        {/* Progress Chart Placeholder */}
        <div className="bg-white rounded-xl p-6 shadow space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Learning Progress</h3>
          <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            Progress Chart Placeholder
          </div>
        </div>

        {/* Recent Courses Section */}
        <div className="bg-white rounded-xl p-6 shadow space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Courses</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex items-center space-x-4">
                <Image
                  src={`/images/course${index}.png`}
                  alt={`Course ${index}`}
                  width={100}
                  height={60}
                  className="rounded-md"
                />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-gray-800">Course Title {index}</h4>
                  <p className="text-xs text-gray-500">Progress: {40 + index * 10}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
