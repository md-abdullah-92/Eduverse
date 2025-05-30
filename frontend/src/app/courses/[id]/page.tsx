"use client";

import { useAuth } from "@/app/auth/context";
import { useToast } from "@/components/ui_elements/toast";
import { CourseData } from "@/utils/types";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import {
  FiAward,
  FiBook,
  FiClock,
  FiPlay,
  FiStar,
  FiUsers,
} from "react-icons/fi";

interface CourseDetailsProps {
  params: Promise<{ id: string }>;
}

interface LoadingState {
  course: boolean;
  enrollment: boolean;
}

// Import utilities
import { CourseUtils } from "@/utils/courseUtils"; // Import CourseUtils
import {
  getButtonConfig,
  handleButtonAction,
  renderStars,
} from "../../courses/utils/couseCardUtils";

export default function CourseDetails({ params }: CourseDetailsProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    course: true,
    enrollment: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [progress] = useState<number>(0); // Add progress tracking logic as needed

  // Get enrollment status from URL params
  const enrollId = searchParams.get("enrolled");
  const isEnrolled = enrollId !== null;
  const isTeacher = user?.role === "TEACHER";
  const { showToast } = useToast();

  const buttonConfig = getButtonConfig(
    course,
    isTeacher,
    isEnrolled,
    progress,
    user?.id || ""
  );

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseUtils = new CourseUtils({
          userId: user?.id || "",
          courseId: resolvedParams.id,
        });
        const courseData = await courseUtils.fetchCourse();
        setCourse(courseData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load course");
      } finally {
        setLoading((prev) => ({ ...prev, course: false }));
      }
    };

    fetchCourse();
  }, [resolvedParams.id, user?.id]);

  // Render action button based on user state
  const renderActionButton = () => {
    return (
      <button
        className={buttonConfig.className}
        onClick={() =>
          handleButtonAction({
            course,
            user,
            isTeacher,
            isEnrolled,
            router,
            showToast,
          })
        }
        disabled={buttonConfig.disabled}
      >
        {buttonConfig.text}
      </button>
    );
  };

  // Loading state
  if (loading.course) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-red-500 text-lg mb-4">
          {error || "Course not found"}
        </div>
        <button
          className="text-teal-600 hover:text-teal-700"
          onClick={() => router.back()}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <div className="absolute inset-0">
          {course.coverPhotoUrl ? (
            <Image
              src={course.coverPhotoUrl}
              alt={course.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gradient-to-r from-teal-400 to-teal-600">
              <FiBook className="h-16 w-16 text-white mb-4" />
              <p className="text-lg font-medium text-white">Course Content</p>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center">
          <div className="max-w-3xl text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {course.title}
            </h1>
            <p className="text-xl mb-6 opacity-90">{course.description}</p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <FiClock className="text-white" />
                <span>{course.lessons?.length || 0} Lessons</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <FiBook className="text-white" />
                <span className="capitalize">
                  {course.level?.toLowerCase() || "Beginner"}
                </span>
              </div>
              {course.averageRating && (
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <FiStar className="text-white" />
                  <span>{course.averageRating.toFixed(1)}</span>
                  {renderStars(course.averageRating)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Learning Outcomes */}
            {course.outcomes?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8 border">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <FiAward className="mr-3 text-teal-600" />
                  What you&apos;ll learn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.outcomes.map((outcome, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-teal-50 border border-teal-100"
                    >
                      <svg
                        className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{outcome.outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Curriculum */}
            <div className="bg-white rounded-xl shadow-sm p-8 border">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FiBook className="mr-3 text-teal-600" />
                Course Curriculum
              </h2>

              {course.lessons?.length > 0 ? (
                <div className="space-y-3">
                  {course.lessons
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="border rounded-lg p-4 hover:border-teal-200 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <span className="text-teal-600 font-medium text-sm">
                                Lesson {index + 1}
                              </span>
                              <h3 className="font-semibold text-gray-900">
                                {lesson.title}
                              </h3>
                            </div>
                            {lesson.description && (
                              <p className="text-gray-600 text-sm mt-2 ml-20">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                          {lesson.videoUrl && (
                            <div className="flex items-center space-x-2 text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                              <FiPlay className="text-sm" />
                              <span className="text-sm font-medium">Video</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No lessons available yet.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border sticky top-6">
              {/* Course Preview */}
              <div className="aspect-video mb-6 bg-gray-100 rounded-lg overflow-hidden">
                {course.coverPhotoUrl ? (
                  <Image
                    src={course.coverPhotoUrl}
                    alt={course.title}
                    width={400}
                    height={225}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200">
                    <FiBook className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {course.price ? `$${course.price}` : "Free"}
                </span>
              </div>

              {/* Action Button */}
              {renderActionButton()}

              {/* Course Features */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="font-medium text-gray-900 mb-4">
                  This course includes:
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center gap-3">
                    <FiClock className="text-teal-600 flex-shrink-0" />
                    <span>Lifetime access</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiAward className="text-teal-600 flex-shrink-0" />
                    <span>Certificate of completion</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiBook className="text-teal-600 flex-shrink-0" />
                    <span>{course.lessons?.length || 0} lessons</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiUsers className="text-teal-600 flex-shrink-0" />
                    <span>Community access</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
