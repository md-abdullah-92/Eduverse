"use client";

import ChatWidget from "@/app/lesson/ChatWidget";

import { ErrorDisplay } from "@/components/ui_elements/ErrorDisplay";
import LoadingIndicator from "@/components/ui_elements/loadingIndicator";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ChartGrid from "../components/ChartGrid";
import DashboardHeader from "../components/DashboardHeader";
import ProfileCard from "../components/ProfileCard";
import RecentCourses from "../components/Recent-Courses";
import Sidebar from "../components/Sidebar";
import StatGrid from "../components/StatGrid";
export default function ModernStudentDashboard() {
  const params = useParams();
  const userId = params?.id;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState("STUDENT");

  useEffect(() => {
    if (!userId) {
      ErrorDisplay({
        error: "User ID not found",
        title: "Profile Fetch Error",
        description:
          "We couldn't load the content you're looking for. This might be a temporary issue.",
      });
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
    return <LoadingIndicator text="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        title="Profile Fetch Error"
        description="We couldn't load the content you're looking for. This might be a temporary issue."
      />
    );
  }

  if (!profile) return null;

  const student = profile;
  const userInfo = student.user || {};

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 relative overflow-hidden font-[${Roboto_Slab.style.fontFamily}]">
      <aside className="w-64 bg-white shadow-md p-4">
        <Sidebar userId={String(userId)} role={role || "STUDENT"} />
      </aside>

      <main className="ml-20 p-5 flex-1">
        <DashboardHeader name={userInfo.name} />
        <ProfileCard student={student} userInfo={userInfo} />
        <StatGrid studentId={String(userId)} />
        <ChartGrid />
        <div className="fixed bottom-15 right-8 z-50">
          <ChatWidget />
        </div>
        <div className="p-7 h-[bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border-1 border-teal-300">
          <RecentCourses userId={String(userId)} />
        </div>
      </main>
    </div>
  );
}
