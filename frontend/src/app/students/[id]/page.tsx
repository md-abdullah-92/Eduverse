"use client";

import ChatWidget from "@/app/chatbot/ChatWidget";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import RecentCourses from "../components/Recent-Courses";
import DashboardHeader from "../components/DashboardHeader";
import ProfileCard from "../components/ProfileCard";
import StatGrid from "../components/StatGrid";
import ChartGrid from "../components/ChartGrid";
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

        if (typeof window !== "undefined") {
          localStorage.setItem("userPhoto", data.studentProfile.profilePhoto || "");
          localStorage.setItem("userName", data.studentProfile.user.name || "Student Name");
          localStorage.setItem("userId", data.studentProfile.userId || userId);
          localStorage.setItem("role", data.studentProfile.user.role || "STUDENT");
          localStorage.setItem("userEmail", data.studentProfile.user.email || "");
          localStorage.setItem("userPhone", data.studentProfile.user.phone || "N/A");
          localStorage.setItem("userBio", data.studentProfile.user.bio || "N/A");
          localStorage.setItem("userCoverPhoto", data.studentProfile.coverPhoto || "N/A");
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
        <div className="text-center font-medium text-gray-700">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500 bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100">
        <div className="text-center font-[${Poppins.style.fontFamily}]">
          <p className="text-xl font-semibold mb-2">Oops! Something went wrong</p>
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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 relative overflow-hidden font-[${Roboto_Slab.style.fontFamily}]">
      <aside className="w-64 bg-white shadow-md p-4">
        <Sidebar userId={userId} role={role || "STUDENT"} />
      </aside>

     <main className="ml-20 p-5 flex-1">
  <DashboardHeader name={userInfo.name} />
  <ProfileCard student={student} userInfo={userInfo} />
  <StatGrid student={student} />
  <ChartGrid />
  <div className="fixed bottom-8 right-8 z-50">
    <ChatWidget />
  </div>
  <div className="p-5 bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20">
    <RecentCourses student={student} />
  </div>
</main>
    </div>
  );
}
