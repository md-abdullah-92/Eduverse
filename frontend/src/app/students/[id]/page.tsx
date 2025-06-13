"use client";

import { ErrorDisplay } from "@/components/ui_elements/ErrorDisplay";
import LoadingIndicator from "@/components/ui_elements/loadingIndicator";
import { useParams } from "next/navigation";
import ChartGrid from "../components/ChartGrid";
import DashboardHeader from "../components/DashboardHeader";
import ProfileCard from "../components/ProfileCard";
import RecentCourses from "../components/Recent-Courses";
import Sidebar from "../components/Sidebar";
import StatGrid from "../components/StatGrid";
import { useStudentProfile } from "@/hooks/useStudentProfile";
export default function ModernStudentDashboard() {
  const params = useParams();
  const userId = params?.id as string | null;
  
  const { profile, role, loading, error } = useStudentProfile(userId);


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
          
        </div>
        
          <RecentCourses userId={String(userId)} />
        
      </main>
    </div>
  );
}
