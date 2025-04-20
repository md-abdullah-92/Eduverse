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

const menuItems = [
  { icon: LayoutDashboard, label: "Dash board" },
  { icon: User, label: "My profile" },
  { icon: BookOpen, label: "Enrolled courses" },
  { icon: Package, label: "Package" },
  { icon: Heart, label: "Wishlist" },
  { icon: Star, label: "Reviews" },
  { icon: ListChecks, label: "My quiz attempts" },
  { icon: History, label: "Order history" },
  { icon: MessageSquare, label: "Question & answer" },
];

const instructorItems = [
  { icon: BookOpen, label: "My courses" },
  { icon: Package, label: "My package" },
  { icon: Megaphone, label: "Announcements" },
  { icon: DollarSign, label: "Withdrawals" },
  { icon: ListChecks, label: "Quiz attempts" },
  { icon: FileText, label: "Assignments" },
  { icon: BadgeCheck, label: "Certificate" },
  { icon: PieChart, label: "Analytics" },
  { icon: LogOut, label: "Logout" },
];

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

const SidebarItem = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer text-sm text-gray-700">
    <Icon size={18} className="text-yellow-500" />
    <span>{label}</span>
  </div>
);

const StatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-white p-4 rounded-xl shadow flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
    <div className={`text-2xl ${color}`}>{icon}</div>
  </div>
);

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

        {/* Profile Section */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Image
              src="/images/team/minhaz.jpg"
              alt="Profile"
              width={60}
              height={60}
              className="rounded-full"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Marley Botosh</h2>
              <p className="text-sm text-gray-500">⭐ 4.8 (280)</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
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
          <StatCard label="Total students" value="1,200" icon={<Users />} color="text-blue-500" />
          <StatCard label="Total sales" value="$230.0" icon={<DollarSign />} color="text-green-500" />
          <StatCard label="Total courses" value="17" icon={<BookOpen />} color="text-cyan-500" />
          <StatCard label="Processing Orders" value="17" icon={<ClipboardList />} color="text-purple-500" />
          <StatCard label="Completed Orders" value="17" icon={<ClipboardList />} color="text-pink-500" />
          <StatCard label="Total orders" value="17" icon={<ClipboardList />} color="text-orange-500" />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <ChartCard title="Students" />
          <ChartCard title="Net Sales" />
        </div>

        {/* Best Selling */}
        <div className="bg-white rounded-xl p-6 shadow space-y-3">
          <h3 className="text-lg font-semibold text-gray-800">Best selling course</h3>
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
                How to Budget and Forecast for your business
              </h4>
              <p className="text-sm text-gray-500">4 Lessons · 1,200 Students · 3 weeks</p>
              <div className="flex items-center space-x-2">
                <p className="text-red-500 text-lg font-bold">$20.0</p>
                <p className="text-sm text-gray-400 line-through">$29.0</p>
              </div>
              <p className="text-sm text-green-600">
                1,210 Courses sold · $42,350.0 Net sales
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const ChartCard = ({ title }: { title: string }) => (
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

const SocialIcon = ({ name }: { name: string }) => (
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

export default Dashboard;
