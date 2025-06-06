"use client";
import {
  BookOpen,
  DollarSign,
  Loader2,
  Users,
  
  
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import ChartCard from "./components/ChartCard";
import StatCard from "./components/StatCard";
import DashboardHeader from "./components/DashboardHeader";
import CoverProfile from "./components/ProfileCover";
import BestSellingCourse from "./components/BestSellingCourse";





type TeacherProfile = {
  user: {
    name: string;
    role: string;
    email: string;
    phone?: string;
    bio?: string;
  };
  profilePhoto: string;
  coverPhoto: string;
  rating: number;
  totalReviews: number;
  totalStudents: number;
  totalSales: number;
  totalCourses: number;
  processingOrders: number;
  completedOrders: number;
  totalOrders: number;
};






// Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
      <p className="text-gray-600 text-lg">Loading your dashboard...</p>
    </div>
  </div>
);

// Error Component
const ErrorComponent = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100">
    <div className="text-center bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-lg">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-red-600 text-2xl">⚠️</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Oops! Something went wrong
      </h2>
      <p className="text-gray-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors duration-200"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Main Dashboard Component
const ModernDashboard = () => {
  const params = useParams();
  const userId = params?.id;
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      if (!userId) {
        setError("User ID not found");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const res = await fetch(`http://localhost:5000/api/profile/${userId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(
          `Failed to fetch profile: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();

      if (!data.teacherProfile) {
        throw new Error("Teacher profile not found");
      }

      setProfile(data.teacherProfile);
      localStorage.setItem("userId", userId.toString());
      localStorage.setItem("role", data.teacherProfile.user.role || "TEACHER");
      localStorage.setItem("userPhoto", data.teacherProfile.profilePhoto || "");
      localStorage.setItem("userName", data.teacherProfile.user.name || "Mentor Name");
      localStorage.setItem("userEmail", data.teacherProfile.user.email || "");
      localStorage.setItem("userPhone", data.teacherProfile.user.phone || "N/A");
      localStorage.setItem("userBio", data.teacherProfile.user.bio || "N/A");
      localStorage.setItem("userCoverPhoto", data.teacherProfile.coverPhoto || "N/A");
      

      // Store data in memory (simulating localStorage)
      console.log("Storing user data:", {
        userPhoto: data.teacherProfile.profilePhoto,
        userName: data.teacherProfile.user.name || "Mentor Name",
        userId: userId,
        role: data.teacherProfile.user.role || "TEACHER",
        userEmail: data.teacherProfile.user.email || "",
        userPhone: data.teacherProfile.user.phone || "N/A",
        userBio: data.teacherProfile.user.bio || "N/A",
        userCoverPhoto: data.teacherProfile.coverPhoto || "N/A",
    
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setError("User ID is required");
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [userId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorComponent message={error} onRetry={fetchProfile} />;
  }

  if (!profile) {
    return (
      <ErrorComponent
        message="Profile data not available"
        onRetry={fetchProfile}
      />
    );
  }

  const userInfo = profile.user || {};
  const role = userInfo.role || "TEACHER";
  localStorage.setItem("role", role);
  localStorage.setItem("userId", userId?.toString() || "12345"); // Fallback for demo purposes

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 relative overflow-hidden">
      <aside className="w-64 bg-white shadow-md p-4">
        <Sidebar role="TEACHER" userId={userId} />
      </aside>
      <main className="ml-20 p-5 flex-1">

      
      <DashboardHeader userName={userInfo.name} />
      <CoverProfile profile={profile} />
        {/* Sidebar */}
      
        {/* Stats Grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          <StatCard
            label="Total Students"
            value={profile.totalStudents?.toLocaleString() || "0"}
            icon={<Users />}
            color="text-blue-500"
            trend="+12%"
            trendUp={true}
          />
          <StatCard
            label="Total Revenue"
            value={`$${profile.totalSales?.toLocaleString() || "0"}`}
            icon={<DollarSign />}
            color="text-green-500"
            trend="+8%"
            trendUp={true}
          />
          <StatCard
            label="Active Courses"
            value={profile.totalCourses?.toString() || "0"}
            icon={<BookOpen />}
            color="text-purple-500"
            trend="+2"
            trendUp={true}
          />
          


        </div>

        {/* Charts Section */}
        <div className="p-5 grid lg:grid-cols-2 gap-8">
          <ChartCard
            title="Student Growth"
            data={[45, 52, 68, 84, 102, 110, 125]}
          />
          <ChartCard
            title="Revenue Trend"
            data={[1200, 1900, 3000, 5000, 4200, 3800, 4500]}
          />
        </div>

        {/* Best Selling Course */}
        <BestSellingCourse />
      
      </main>
    </div>
  );
};

export default ModernDashboard;