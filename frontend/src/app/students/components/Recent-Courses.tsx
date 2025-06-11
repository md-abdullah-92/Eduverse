"use client";

import CourseCard from "@/app/courses/components/courseCard";
import LoadingIndicator from "@/components/ui_elements/loadingIndicator";
import { Enrollment } from "@/utils/types";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

// Props type
interface RecentCoursesProps {
  userId: string;
}

const RecentCourses: React.FC<RecentCoursesProps> = ({ userId }) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        console.log(userId);
        // Fetch enrollments for the student
        const res = await fetch(
          `http://localhost:5001/api/enrollments/student/${userId}`
        );
        const enrollments = await res.json();
        localStorage.setItem(
          "totalEnrolledCourses",
          enrollments.length.toString()
        );

        setEnrollments(enrollments);
      } catch (error) {
        console.log("Failed to fetch enrolled courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-8 border border-gray-100">
        <LoadingIndicator text="Loading your enrolled courses..." />
      </div>
    );
  }

  const totalEnrollments = enrollments.length;
  const averageProgress =
    totalEnrollments > 0
      ? enrollments.reduce(
          (sum, enrollment) => sum + Number(enrollment.progressPercentage),
          0
        ) / totalEnrollments
      : 0;

  return (
    <div className="space-y-6">
      {/* Header Section with Stats */}
      <div className="bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Your Learning Journey</h3>
              <p className="text-teal-100 text-sm">
                Continue your enrolled courses
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              (window.location.href = `/students/${userId}/enrolled_course/`)
            }
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full px-6 py-3 font-medium text-sm flex items-center space-x-2 transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <span>View All Courses</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex items-center space-x-8 mt-6">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-teal-200" />
            <span className="text-sm text-teal-100">
              {totalEnrollments} Course{totalEnrollments !== 1 ? "s" : ""}{" "}
              Enrolled
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-teal-200" />
            <span className="text-sm text-teal-100">
              {averageProgress.toFixed(1)}% Average Progress
            </span>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {enrollments.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">
              Recent Courses
            </h4>
            <span className="text-sm text-gray-500">
              Showing {Math.min(3, enrollments.length)} of {enrollments.length}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.slice(0, 3).map((enrollment, index) => (
              <div
                key={enrollment.courseId}
                className="transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: `fadeInUp 0.6s ease-out forwards`,
                }}
              >
                <CourseCard
                  course={enrollment.course}
                  enrollmentId={enrollment.id}
                  isEnrolled={true}
                  progress={Number(enrollment.progressPercentage).toFixed(2)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Empty State
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-teal-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Courses Yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start your learning journey by enrolling in your first course.
            Discover new skills and knowledge today!
          </p>
          <button
            onClick={() => (window.location.href = "/courses")}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-medium px-8 py-3 rounded-full transition-all duration-200 hover:shadow-lg hover:scale-105"
          >
            Browse Courses
          </button>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default RecentCourses;
