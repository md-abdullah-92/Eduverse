"use client";
import { useAuth } from "@/app/auth/context";
import { ErrorDisplay } from "@/components/ui_elements/ErrorDisplay";
import LoadingIndicator from "@/components/ui_elements/loadingIndicator";
import { playfair } from "@/utils/font";
import { Enrollment } from "@/utils/types";
import { Award, BookOpen, Clock, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CompletedCoursesList() {
  const [completedCourses, setCompletedCourses] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCompletedCourses();
    } else {
      setLoading(false);
      setError("No student ID found. Please log in again.");
    }
  }, [user]);

  const fetchCompletedCourses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(""); // Clear any previous errors
      const response = await fetch(
        `http://localhost:5001/api/enrollments/stats/${user.id}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Safely handle the response data
      const courses = data?.data.completedCoursesData || [];
      setCompletedCourses(courses);
    } catch (err) {
      setError("Failed to fetch completed courses");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId: number) => {
    // Navigate to certificate page
    router.push(`/certificates/${courseId}`);
  };

  if (loading) {
    return <LoadingIndicator text="Loading completed courses..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchCompletedCourses} />;
  }

  if (completedCourses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Completed Courses Yet
          </h3>
          <p className="text-gray-600">
            Complete your first course to earn a certificate!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 gap-6">
      <div className="mb-8 flex flex-col items-center justify-center gap-4">
        <h1
          className={`text-3xl text-gray-900 mb-2 font-bold ${playfair.className}`}
        >
          Completed Courses
        </h1>
        <p className="text-gray-600">
          Congratulations! You have completed {completedCourses.length} course
          {completedCourses.length !== 1 ? "s" : ""}. Click to view and download
          your certificate.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {completedCourses.map((enrollment) => (
          <div
            key={enrollment.course.id}
            onClick={() => handleCourseClick(enrollment.courseId)}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer transform hover:scale-105 transition-transform duration-200"
          >
            <div className="relative">
              <img
                src={enrollment.course.coverPhotoUrl || ""}
                alt={enrollment.course.title}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <Award className="w-4 h-4 mr-1" />
                Completed
              </div>
            </div>

            <div className="p-6">
              <div className="mb-2">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {enrollment.course.topic}
                </span>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                {enrollment.course.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {enrollment.course.description}
              </p>

              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Instructor: {enrollment.course.instructorId}</span>
                </div>

                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>
                    Duration:{" "}
                    {Array.isArray(enrollment.course.lessons)
                      ? enrollment.course.lessons.length
                      : 0}{" "}
                    lessons
                  </span>
                </div>

                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span>
                    {Array.isArray(enrollment.course.lessons)
                      ? enrollment.course.lessons.length
                      : 0}{" "}
                    lessons completed
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center">
                  <Award className="w-4 h-4 mr-2" />
                  View Certificate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
