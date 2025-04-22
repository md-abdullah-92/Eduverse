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
import React from "react";

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
};

// Menu Data
const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: User, label: "My Profile" },
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
const Sidebar = () => (
  <aside className="w-72 h-full bg-white border-r px-5 py-6 space-y-4">
    <nav className="space-y-1">
      {menuItems.map((item, i) => (
        <SidebarItem key={i} icon={item.icon} label={item.label} />
      ))}
    </nav>
    <h4 className="text-xs uppercase text-gray-400 mt-6">Instructor</h4>
    <nav className="space-y-1">
      {instructorItems.map((item, i) => (
        <SidebarItem key={i} icon={item.icon} label={item.label} />
      ))}
    </nav>
  </aside>
);

const SidebarItem = ({ icon: Icon, label }: SidebarItemProps) => (
  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer text-sm text-gray-700">
    <Icon size={18} className="text-yellow-500" />
    <span>{label}</span>
  </div>
);

// Cards
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

// Social Icon
const SocialIcon = ({ name }: SocialIconProps) => (
  <div className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 cursor-pointer">
    <Image
      src={`/icons/${name}.svg`}
      alt={name}
      width={16}
      height={16}
      className="object-contain"
    />
  </div>
);

// Dashboard Component
const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6">
        {/* Cover Photo */}
        <div className="relative w-full h-64 md:h-80 lg:h-[400px] rounded-xl overflow-hidden">
          <Image
            src="/images/course1.png"
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

        {/* Profile Overlap */}
        <div className="relative -mt-20 pl-6 flex items-end gap-6">
          <Image
            src="/images/team/minhaz.jpg"
            alt="Profile"
            width={160}
            height={160}
            className="rounded-full border-4 border-white shadow-lg"
          />
          <div className="flex-1 flex justify-between items-center pr-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Marley Botosh</h2>
              <p className="text-sm text-gray-500">⭐ 4.8 (280)</p>
            </div>
            <div className="flex space-x-2">
              <SocialIcon name="facebook" />
              <SocialIcon name="tiktok" />
              <SocialIcon name="youtube" />
              <SocialIcon name="mail" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total Students" value="1,200" icon={<Users />} color="text-blue-500" />
          <StatCard label="Total Sales" value="$230.0" icon={<DollarSign />} color="text-green-500" />
          <StatCard label="Total Courses" value="17" icon={<BookOpen />} color="text-cyan-500" />
          <StatCard label="Processing Orders" value="17" icon={<ClipboardList />} color="text-purple-500" />
          <StatCard label="Completed Orders" value="17" icon={<ClipboardList />} color="text-pink-500" />
          <StatCard label="Total Orders" value="17" icon={<ClipboardList />} color="text-orange-500" />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <ChartCard title="Students" />
          <ChartCard title="Net Sales" />
        </div>

        {/* Best Selling Course */}
        <div className="bg-white rounded-xl p-6 shadow space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Best Selling Course</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <Image
              src="/course-thumbnail.jpg"
              alt="Course"
              width={300}
              height={200}
              className="rounded-lg"
            />
            <div className="space-y-1">
              <h4 className="text-gray-800 font-semibold text-lg">
                How to Budget and Forecast for Your Business
              </h4>
              <p className="text-sm text-gray-500">4 Lessons · 1,200 Students · 3 Weeks</p>
              <div className="flex items-center space-x-2">
                <p className="text-red-500 text-lg font-bold">$20.0</p>
                <p className="text-sm text-gray-400 line-through">$29.0</p>
              </div>
              <p className="text-sm text-green-600">
                1,210 Courses Sold · $42,350.0 Net Sales
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
