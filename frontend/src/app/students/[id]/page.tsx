"use client";

import {
  Award,
  BadgeCheck,
  Bell,
  BookOpen,
  Calendar,
  ChevronRight,
  ClipboardList,
  Eye,
  FileText,
  Heart,
  History,
  ListChecks,
  LogOut,
  Play,
  Search,
  Settings,
  ShoppingCart,
  Star,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import StudentMarkProgressChart from "../components/StudentMarkProgressChart";
import StudyTimeBarChart from "../components/StudyTimeBarChart";
import ChatWidget from "@/components/ChatWidget";


// Types
type NavigationItem = {
  icon: React.ElementType;
  label: string;
  badge?: number;
};

type StatCardProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  trendUp?: boolean;
};


type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  badge?: number;
  isActive?: boolean;
};

// Navigation Data
const studentNavigationItems: NavigationItem[] = [
  { icon: User, label: "Update Profile" },
  { icon: BookOpen, label: "Enrolled Courses", badge: 5 },
  { icon: Heart, label: "Wishlist", badge: 12 },
  { icon: Star, label: "Reviews" },
  { icon: ListChecks, label: "Quiz Attempts" },
  { icon: FileText, label: "Assignments", badge: 3 },
  { icon: BadgeCheck, label: "Certificates" },
  { icon: History, label: "Order History" },
  { icon: ShoppingCart, label: "Cart" },
  { icon: LogOut, label: "Logout" },
];

// Sidebar Components
const SidebarItem = ({
  icon: Icon,
  label,
  onClick,
  badge,
  isActive,
}: SidebarItemProps) => (
  <div
    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
      isActive
        ? "bg-gradient-to-r from-teal-700 to-purple-600 text-white shadow-lg"
        : "hover:bg-gray-50 text-gray-700 hover:text-teal-600"
    }`}
    onClick={onClick}
  >
    <div className="flex items-center space-x-3">
      <Icon
        size={20}
        className={`transition-colors duration-300 ${
          isActive ? "text-white" : "text-teal-500 group-hover:text-teal-600"
        }`}
      />
      <span className="font-normal text-sm">{label}</span>
    </div>
    <div className="flex items-center space-x-2">
      {badge && (
        <span
          className={`px-2 py-1 text-xs rounded-full font-semibold ${
            isActive ? "bg-white/20 text-white" : "bg-teal-100 text-teal-600"
          }`}
        >
          {badge}
        </span>
      )}
      <ChevronRight
        size={14}
        className={`transition-all duration-300 ${
          isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
        }`}
      />
    </div>
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform animate-in zoom-in-95 duration-300">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <LogOut className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Confirm Logout
          </h2>
          <p className="text-gray-600">
            Are you sure you want to log out of EduVerse?
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({
  userId,
  role,
}: {
  userId: string | string[];
  role: string;
}) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");

  const router = useRouter();

  const handleClick = (label: string) => {
    if (label === "Logout") {
      setShowLogoutModal(true);
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
    if (label === "My Courses") {
      router.push(`/teachers/${userId}/all/`);
      return;
    }
    if (label === "Enrolled Courses") {
      router.push(`/students/${userId}/enrolled_course`);
      return;
    }
    if (label === "Create Course") {
      router.push(`/teachers/${userId}/create_course/`);
      return;
    }
    if (label === "Cart") {
      router.push(`/cart/${userId}`);
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
    router.push("/"); // Actually navigate to home
  };

  return (
    <>
      <aside className="w-80 h-full bg-white/80 backdrop-blur-xl border-r border-gray-200/50 px-6 py-8 space-y-8 shadow-lg">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-3 pb-6 border-b border-gray-100">
          <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
              EduVerse
            </h1>
            <p className="text-xs text-gray-500">Student Portal</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div>
          <nav className="space-y-2">
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
        </div>
      </aside>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
};

// Enhanced Stats Card
const StatCard = ({
  label,
  value,
  icon,
  color,
  trend,
  trendUp,
}: StatCardProps) => (
  <div className="group bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20">
    <div className="flex items-center justify-between mb-4">
      <div
        className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}
      >
        <div className={`${color.replace("text-", "text-")} text-2xl`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div
          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
            trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          <TrendingUp
            size={12}
            className={trendUp ? "rotate-0" : "rotate-180"}
          />
          <span>{trend}</span>
        </div>
      )}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  </div>
);

// Enhanced Chart Card

// Social Icons Component
const SocialIcon = ({ name }: { name: string }) => {
  const getIconColor = (name: string) => {
    switch (name) {
      case "facebook":
        return "from-teal-500 to-teal-600";
      case "youtube":
        return "from-red-500 to-red-600";
      case "tiktok":
        return "from-gray-800 to-black";
      case "mail":
        return "from-gray-500 to-gray-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div
      className={`p-3 rounded-xl bg-gradient-to-r ${getIconColor(
        name
      )} hover:scale-110 transition-transform duration-300 cursor-pointer shadow-lg`}
    >
      <div className="w-5 h-5 bg-white rounded-sm" />
    </div>
  );
};

// Main Student Dashboard Component
export default function ModernStudentDashboard() {
  const params = useParams();
  const userId = params?.id;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState("STUDENT");

  useEffect(() => {
    if (!userId) {
      setError("User ID not found");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/profile/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        if (!data.studentProfile) throw new Error("Student profile not found");

        setProfile(data.studentProfile);
        setRole(data.studentProfile?.user?.role || "STUDENT");

        // Store data in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "userPhoto",
            data.studentProfile.profilePhoto || ""
          );
          localStorage.setItem(
            "userName",
            data.studentProfile.user.name || "Student Name"
          );
          localStorage.setItem("userId", data.studentProfile.userId || userId);
          localStorage.setItem(
            "role",
            data.studentProfile.user.role || "STUDENT"
          );
          localStorage.setItem(
            "userEmail",
            data.studentProfile.user.email || ""
          );
          localStorage.setItem(
            "userPhone",
            data.studentProfile.user.phone || "N/A"
          );
          localStorage.setItem(
            "userBio",
            data.studentProfile.user.bio || "N/A"
          );
          localStorage.setItem(
            "userCoverPhoto",
            data.studentProfile.coverPhoto || "N/A"
          );
        }

        console.log("Profile data:", data.studentProfile);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500 bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">
            Oops! Something went wrong
          </p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const student = profile;
  const userInfo = student.user || {};

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-teal-300 to-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
      <div
        className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-r from-cyan-300 to-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
        style={{ animationDelay: "4s" }}
      />

      <Sidebar userId={userId} role={role} />

      <main className="flex-1 p-8 space-y-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Welcome back, {userInfo.name || "Student"}! 📚
            </h1>
            <p className="text-gray-600 mt-1">
              Continue your learning journey and track your progress.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses..."
                className="pl-10 pr-4 py-3 bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <button className="p-3 bg-white/70 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/90 transition-colors duration-200">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-3 bg-white/70 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/90 transition-colors duration-200">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Cover Photo Section */}
        <div className="relative w-full h-80 rounded-3xl overflow-hidden shadow-2xl group">
          {student.coverPhoto && student.coverPhoto !== "N/A" ? (
            <img
              src={student.coverPhoto}
              alt="Cover"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-purple-600 to-cyan-500" />
          )}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between">
            <div className="flex items-end space-x-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-xl overflow-hidden">
                  {student.profilePhoto ? (
                    <img
                      src={student.profilePhoto}
                      alt={userInfo.name || "Profile"}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-400 to-purple-500 rounded-xl flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
              <div className="text-white pb-4">
                <h2 className="text-2xl font-bold mb-2">
                  {userInfo.name || "Student"}
                </h2>
                <div className="flex items-center space-x-4 text-white/90">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                      {student.averageScore || 0}% Avg Score
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>Active Learner</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>Student ID: {student.studentId || "N/A"}</span>
                  </div>
                </div>
                {userInfo.bio && userInfo.bio !== "N/A" && (
                  <p className="text-white/80 text-sm mt-2 max-w-md">
                    {userInfo.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <SocialIcon name="facebook" />
              <SocialIcon name="youtube" />
              <SocialIcon name="tiktok" />
              <SocialIcon name="mail" />
              <button className="px-6 py-3 bg-white/20 backdrop-blur-md text-white font-medium rounded-xl hover:bg-white/30 transition-colors duration-200 border border-white/20">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard
            label="Courses Enrolled"
            value={(student.coursesEnrolled || 0).toString()}
            icon={<BookOpen />}
            color="text-teal-500"
            trend="+2"
            trendUp={true}
          />
          <StatCard
            label="Certificates Earned"
            value={(student.certificatesEarned || 0).toString()}
            icon={<BadgeCheck />}
            color="text-green-500"
            trend="+1"
            trendUp={true}
          />
          <StatCard
            label="Lessons Completed"
            value={(student.lessonsCompleted || 0).toString()}
            icon={<ClipboardList />}
            color="text-cyan-500"
            trend="+15"
            trendUp={true}
          />
          <StatCard
            label="Quiz Attempts"
            value={(student.quizAttempts || 0).toString()}
            icon={<ListChecks />}
            color="text-purple-500"
            trend="+3"
            trendUp={true}
          />
          <StatCard
            label="Study Hours"
            value={(student.studyHours || 0).toString()}
            icon={<History />}
            color="text-orange-500"
            trend="+25h"
            trendUp={true}
          />
          <StatCard
            label="Reviews Given"
            value={(student.reviewsGiven || 0).toString()}
            icon={<Star />}
            color="text-yellow-500"
            trend="+2"
            trendUp={true}
          />
        </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StudyTimeBarChart />
      <StudentMarkProgressChart />
    </div>

      

   

        {/* Chat Icon Draggable Component */}
        <div className="fixed bottom-8 right-8 z-50">
         <ChatWidget />
        </div>


        

        {/* Recent Courses Section */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-teal-500" />
              <span>Recent Courses</span>
            </h3>
            <button className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center space-x-1">
              <span>View All</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {student.recentCourses && student.recentCourses.length > 0
              ? student.recentCourses
                  .slice(0, 3)
                  .map((course: any, index: number) => (
                    <div
                      key={course.id || index}
                      className="bg-white/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${
                              index === 0
                                ? "from-teal-500 to-purple-600"
                                : index === 1
                                ? "from-green-500 to-teal-600"
                                : "from-orange-500 to-red-600"
                            }`}
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-6 h-6 text-white ml-1" />
                          </div>
                        </div>
                        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-full text-xs font-semibold">
                          {course.progress || 0}% Complete
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                          {course.title || `Course ${index + 1}`}
                        </h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Users size={14} />
                            <span>{course.enrolledCount || 0} students</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>{course.duration || "N/A"}</span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${
                              index === 0
                                ? "from-teal-500 to-purple-600"
                                : index === 1
                                ? "from-green-500 to-teal-600"
                                : "from-orange-500 to-red-600"
                            }`}
                            style={{ width: `${course.progress || 0}%` }}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 text-sm">
                            <Play size={14} />
                            <span>Continue</span>
                          </button>
                          <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm">
                            <Eye size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              : // Fallback when no recent courses data
                [1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="bg-white/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${
                          index === 1
                            ? "from-teal-500 to-purple-600"
                            : index === 2
                            ? "from-green-500 to-teal-600"
                            : "from-orange-500 to-red-600"
                        }`}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-full text-xs font-semibold">
                        {Math.floor(Math.random() * 80) + 10}% Complete
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                        Sample Course {index}
                      </h4>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Users size={14} />
                          <span>
                            {Math.floor(Math.random() * 500) + 100} students
                          </span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{Math.floor(Math.random() * 10) + 2}h</span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${
                            index === 1
                              ? "from-teal-500 to-purple-600"
                              : index === 2
                              ? "from-green-500 to-teal-600"
                              : "from-orange-500 to-red-600"
                          }`}
                          style={{
                            width: `${Math.floor(Math.random() * 80) + 10}%`,
                          }}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 text-sm">
                          <Play size={14} />
                          <span>Continue</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm">
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </main>
    </div>
  );
}
