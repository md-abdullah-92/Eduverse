"use client";

import { ErrorDisplay } from "@/components/ui_elements/ErrorDisplay";
import LoadingIndicator from "@/components/ui_elements/loadingIndicator";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { poppins, raleway } from "@/utils/font";
import { useParams } from "next/navigation";
import ChartGrid from "../components/ChartGrid";
import ProfileCard from "../components/ProfileCard";
import RecentCourses from "../components/Recent-Courses";
import Sidebar from "../components/Sidebar";
import StatGrid from "../components/StatGrid";
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
        <div className="flex justify-between items-center px-6 py-4">
          <div>
            <h1
              className={`text-4xl font-bold bg-gradient-to-r from-teal-900 to-teal-600 bg-clip-text text-transparent ${raleway.className}`}
            >
              Welcome back, {userInfo.name || "Student"}!
            </h1>
            <p
              className={`mt-2 text-gray-600 italic text-base ${poppins.className}`}
            >
              Continue your learning journey and track your progress.
            </p>
          </div>
        </div>
        <ProfileCard student={student} userInfo={userInfo} />
        <StatGrid studentId={String(userId)} />
        <ChartGrid />
        <div className="fixed bottom-15 right-8 z-50"></div>

        <RecentCourses userId={String(userId)} />
      </main>
    </div>
  );
}
