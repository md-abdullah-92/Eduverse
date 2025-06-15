"use client";

import { useTeacherProfile } from "@/hooks/useTeacherProfile";
import { BookOpen, DollarSign, Users } from "lucide-react";
import { useParams } from "next/navigation";
import BestSellingCourse from "../components/BestSellingCourse";
import CoverProfile from "../components/ProfileCover";
import Sidebar from "../../../components/Common-Components/Sidebar";
import StatCard from "../components/StatCard";

import { ErrorDisplay } from "@/components/ui_elements/ErrorDisplay";
import LoadingIndicator from "@/components/ui_elements/loadingIndicator";
import { poppins, raleway } from "@/utils/font";
import TeacherStatsPage from "../components/TeacherStatsPage";

// Main Dashboard Component
const ModernDashboard = () => {
  const params = useParams();
  const rawId = params?.id;
  const userId = Array.isArray(rawId) ? rawId[0] : rawId;
  const { profile, teacherStats, loading, error, refetch } =
    useTeacherProfile(userId);
  const bestSellingCourse = teacherStats?.bestSellingCourse;

  if (loading) return <LoadingIndicator text="Loading teacher profile..." />;
  if (error) return <ErrorDisplay error={error} onRetry={refetch} />;
  if (!profile)
    return <ErrorDisplay error="Profile not found." onRetry={refetch} />;

  const userInfo = profile.user;
  localStorage.setItem("role", userInfo.role || "TEACHER");
  localStorage.setItem("userId", userId?.toString() || "12345");

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 relative overflow-hidden">
      <aside className="w-64 bg-white shadow-md p-4">
        <Sidebar role="TEACHER" userId={userId!} />
      </aside>
      <main className="ml-20 p-5 flex-1">
        <div className="flex justify-between items-center px-6 py-4">
          <div>
            <h1
              className={`text-4xl font-bold bg-gradient-to-r from-teal-900 to-teal-600 bg-clip-text text-transparent ${raleway.className}`}
            >
              Welcome back, {userInfo.name || "Teacher"}!
            </h1>
            <p
              className={`mt-2 text-gray-600 italic text-base ${poppins.className}`}
            >
              Continue your teaching journey and track your courses.
            </p>
          </div>
        </div>
        <CoverProfile profile={profile} teacherStats={teacherStats!} />
        
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          <div className="border-1 border-teal-500 rounded-2xl shadow-sm hover:shadow-md transition duration-300">
            <StatCard
              label="Total Students"
              value={teacherStats?.totalStudents.toString() || "0"}
              icon={<Users />}
              color="text-blue-500"
              trend="+12%"
              trendUp={true}
            />
          </div>

          <div className="border-1 border-teal-500 rounded-2xl shadow-sm hover:shadow-md transition duration-300">
            <StatCard
              label="Total Revenue"
              value={`৳ ${teacherStats?.totalRevenue.toFixed(2) || "0"}`}
              icon={<DollarSign />}
              color="text-green-500"
              trend="+8%"
              trendUp={true}
            />
          </div>

          <div className="border-1 border-teal-500 rounded-2xl shadow-sm hover:shadow-md transition duration-300">
            <StatCard
              label="Active Courses"
              value={teacherStats?.totalCourses.toString() || "0"}
              icon={<BookOpen />}
              color="text-purple-500"
              trend="+2"
              trendUp={true}
            />
          </div>
        </div>
        
         <TeacherStatsPage teacherId={userId!} />

         {/*some space*/}
        <div className="h-10"></div>
         
        {bestSellingCourse && (
          <BestSellingCourse bestSellingCourse={bestSellingCourse!} />
        )}
      </main>
    </div>
  );
};

export default ModernDashboard;
