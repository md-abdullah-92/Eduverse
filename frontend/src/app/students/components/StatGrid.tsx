import { ErrorDisplay } from "@/components/ui_elements/ErrorDisplay";
import LoadingIndicator from "@/components/ui_elements/loadingIndicator";
import {
  Award,
  BadgeCheck,
  BookOpen,
  ClipboardList,
  Star,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import StatCard from "./StatCard";

interface StudentStats {
  totalEnrollments: number;
  averageProgress: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

export default function StatGrid({ studentId }: { studentId: string }) {
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const BASE_URL = "http://localhost:5001/api/";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch student enrollment stats
        const studentResponse = await fetch(
          `${BASE_URL}enrollments/stats/${studentId}`
        );
        const studentData = await studentResponse.json();

        // Fetch student review stats
        const reviewResponse = await fetch(
          `${BASE_URL}reviews/student/${studentId}`
        );
        const reviewData = await reviewResponse.json();

        setStudentStats(studentData.success ? studentData.data : null);
        setReviewStats(reviewData.success ? reviewData.data : null);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStats();
    }
  }, [studentId]);

  if (loading) {
    return <LoadingIndicator text="Loading your statistics..." />;
  }

  if (error) {
    return (
      <div style={{ height: "100vh" }}>
        <ErrorDisplay error={error} title="Stats Fetch Error" />
      </div>
    );
  }

  // Calculate progress percentage for lessons
  const lessonProgressPercentage = studentStats?.totalLessons
    ? Math.round(
        ((studentStats.completedLessons || 0) / studentStats.totalLessons) * 100
      )
    : 0;

  return (
    <div className="p-5 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      <StatCard
        label="Courses Enrolled"
        value={`${studentStats?.totalEnrollments || 0}`}
        icon={<BookOpen />}
        color="text-teal-500"
        trend={
          studentStats?.totalEnrollments
            ? `${studentStats.totalEnrollments}`
            : "0"
        }
        trendUp
      />

      <StatCard
        label="Courses Completed"
        value={`${studentStats?.completedCourses || 0}`}
        icon={<BadgeCheck />}
        color="text-green-500"
        trend={
          studentStats?.completedCourses
            ? `+${studentStats.completedCourses}`
            : "0"
        }
        trendUp
      />

      <StatCard
        label="Lessons Completed"
        value={`${studentStats?.completedLessons || 0}/${
          studentStats?.totalLessons || 0
        }`}
        icon={<ClipboardList />}
        color="text-cyan-500"
        trend={`${lessonProgressPercentage}%`}
        trendUp={lessonProgressPercentage > 0}
      />

      <StatCard
        label="Average Progress"
        value={`${Math.round(studentStats?.averageProgress || 0)}%`}
        icon={<TrendingUp />}
        color="text-purple-500"
        trend={
          studentStats?.averageProgress
            ? studentStats.averageProgress > 50
              ? "Good"
              : "Improving"
            : "No progress"
        }
        trendUp={
          studentStats?.averageProgress
            ? studentStats.averageProgress > 50
            : false
        }
      />

      <StatCard
        label="Average Rating"
        value={
          reviewStats?.averageRating
            ? `${reviewStats.averageRating.toFixed(1)}★`
            : "No ratings"
        }
        icon={<Star />}
        color="text-yellow-500"
        trend={
          reviewStats?.averageRating
            ? reviewStats.averageRating >= 4
              ? "Excellent"
              : reviewStats.averageRating >= 3
              ? "Good"
              : "Fair"
            : "No ratings"
        }
        trendUp={
          reviewStats?.averageRating ? reviewStats.averageRating >= 4 : false
        }
      />

      <StatCard
        label="Total Reviews"
        value={`${reviewStats?.totalReviews || 0}`}
        icon={<Award />}
        color="text-orange-500"
        trend={
          reviewStats?.totalReviews
            ? `${reviewStats.totalReviews} reviews`
            : "No reviews"
        }
        trendUp={
          reviewStats?.totalReviews ? reviewStats.totalReviews > 0 : false
        }
      />
    </div>
  );
}
