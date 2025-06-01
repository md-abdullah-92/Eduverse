"use client";

import { useAuth } from "@/app/auth/context";
import { useToast } from "@/components/ui_elements/toast";
import { CourseData, Enrollment } from "@/utils/types";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiAward,
  FiBook,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiHeart,
  FiPlay,
  FiPlayCircle,
  FiShare2,
  FiStar,
  FiTrendingUp,
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
import {
  getButtonConfig,
  handleButtonAction,
  renderStars,
} from "../../courses/utils/couseCardUtils";

import { EnrollmentUtils } from "@/utils/enrollmentUtils";
export default function CourseDetails({ params }: CourseDetailsProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [course, setCourse] = useState<CourseData | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    course: true,
    enrollment: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [progress] = useState<number>(0);

  const [activeTab, setActiveTab] = useState<"overview" | "reviews">(
    "overview"
  );

  // Get enrollment status from URL params
  const enrollmentId = searchParams.get("enrolled");
  const isEnrolled = enrollmentId !== null;
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
        if (!isEnrolled || !enrollmentId || !user?.id) return;

        const enrollmentUtils = new EnrollmentUtils({
          userId: user?.id,
        });
        const enrollment = await enrollmentUtils.fetchEnrollment(
          Number(enrollmentId)
        );
        setEnrollment(enrollment);
        setCourse(enrollment.course);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load course");
      } finally {
        setLoading((prev) => ({ ...prev, course: false }));
      }
    };

    fetchCourse();
  }, [resolvedParams.id, user?.id, isEnrolled, enrollmentId]);

  // Loading state
  if (loading.course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">
            Loading course details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col justify-center items-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBook className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Course Not Found
          </h2>
          <p className="text-slate-600 mb-6">
            {error ||
              "The course you're looking for doesn't exist or has been removed."}
          </p>
          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
            onClick={() => router.back()}
          >
            <FiArrowLeft className="inline mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background with improved overlay */}
        <div className="absolute inset-0 h-[70vh]">
          {course.coverPhotoUrl ? (
            <Image
              src={course.coverPhotoUrl}
              alt={course.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>

        {/* Navigation Bar */}
        <div className="relative z-20 bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-white hover:text-emerald-300 transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Courses</span>
              </button>

              <div className="flex items-center space-x-4">
                <button className="p-2 text-white hover:text-emerald-300 transition-colors">
                  <FiShare2 className="w-5 h-5" />
                </button>
                <button className="p-2 text-white hover:text-emerald-300 transition-colors">
                  <FiHeart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-32">
          <div className="max-w-4xl">
            {/* Course Category Badge */}
            <div className="inline-flex items-center bg-emerald-500/20 backdrop-blur-sm text-emerald-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <FiBook className="w-4 h-4 mr-2" />
              {course.level?.toLowerCase() || "Course"}
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {course.title}
            </h1>

            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl">
              {course.description}
            </p>

            {/* Enhanced Stats */}
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center space-x-3 bg-white/15 backdrop-blur-sm px-6 py-3 rounded-2xl">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FiClock className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Lessons</p>
                  <p className="text-white font-semibold">
                    {course.lessons?.length || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-white/15 backdrop-blur-sm px-6 py-3 rounded-2xl">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FiUsers className="text-white w-5 h-5" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Students</p>
                  <p className="text-white font-semibold">1,234</p>
                </div>
              </div>

              {course.averageRating && (
                <div className="flex items-center space-x-3 bg-white/15 backdrop-blur-sm px-6 py-3 rounded-2xl">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <FiStar className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Rating</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold">
                        {course.averageRating.toFixed(1)}
                      </span>
                      <div className="flex">
                        {renderStars(course.averageRating)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Card Overlay */}
      <div className="relative -mt-20 z-30 max-w-7xl mx-auto px-6">
        {/* Enrollment Progress Banner */}
        {isEnrolled && (
          <div className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl text-white overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <FiTrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Your Progress</h3>
                    <p className="text-emerald-100">
                      {enrollment?.lessonCompletions.length} of{" "}
                      {course?.lessons?.length || 0} lessons completed
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold mb-1">
                    {course?.lessons?.length
                      ? Math.round(enrollment?.progressPercentage || 0)
                      : 0}
                    %
                  </div>
                  <p className="text-emerald-100 text-sm">Complete</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                <div
                  className="bg-white rounded-full h-3 transition-all duration-500 ease-out"
                  style={{
                    width: course?.lessons?.length
                      ? `${enrollment?.progressPercentage || 0}%`
                      : "0%",
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-sm text-emerald-100">
                <div className="flex items-center space-x-2">
                  <FiCalendar className="w-4 h-4" />
                  <span>
                    Enrolled{" "}
                    {new Date(enrollment!.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs Navigation */}
            <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
              <div className="border-b border-slate-100">
                <nav className="flex">
                  {[
                    { key: "overview", label: "Overview", icon: FiBook },
                    { key: "reviews", label: "Reviews", icon: FiStar },
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key as any)}
                      className={`flex items-center space-x-2 px-8 py-4 font-medium transition-all ${
                        activeTab === key
                          ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-8">
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    {/* Course Description */}
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-6">
                        About this course
                      </h3>
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-600 leading-relaxed text-lg">
                          {course.description ||
                            "This comprehensive course will guide you through essential concepts and practical applications, designed to help you master the subject matter effectively."}
                        </p>
                      </div>
                    </div>
                    {/* Learning Outcomes */}
                    {course.outcomes?.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                            <FiAward className="w-4 h-4 text-emerald-600" />
                          </div>
                          What you&apos;ll learn
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {course.outcomes.map((outcome, index) => (
                            <div
                              key={index}
                              className="flex items-start space-x-4 p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 hover:shadow-md transition-all duration-200"
                            >
                              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <FiCheckCircle className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-slate-700 leading-relaxed">
                                {outcome.outcome}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-slate-900 flex items-center">
                          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                            <FiPlay className="w-4 h-4 text-emerald-600" />
                          </div>
                          Course Curriculum
                        </h3>
                        {isEnrolled && (
                          <div className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                            {enrollment?.lessonCompletions.length}/
                            {course?.lessons?.length || 0} completed
                          </div>
                        )}
                      </div>

                      {course.lessons?.length > 0 ? (
                        <div className="space-y-4">
                          {course.lessons
                            .sort((a, b) => a.orderIndex - b.orderIndex)
                            .map((lesson, index) => {
                              const isCompleted =
                                enrollment?.lessonCompletions.some(
                                  (completion) =>
                                    completion.lessonId === Number(lesson.id)
                                );
                              return (
                                <div
                                  key={lesson.id}
                                  className={`group border rounded-xl p-6 transition-all duration-300 bg-white ${
                                    isCompleted
                                      ? "border-emerald-200 bg-emerald-50/30"
                                      : "border-slate-200 hover:border-emerald-200 hover:shadow-lg"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-4 mb-3">
                                        <div
                                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                                            isCompleted
                                              ? "bg-emerald-500 text-white"
                                              : "bg-emerald-100 text-emerald-600"
                                          }`}
                                        >
                                          {isCompleted ? (
                                            <FiCheckCircle className="w-4 h-4" />
                                          ) : (
                                            index + 1
                                          )}
                                        </div>

                                        <div className="flex-1">
                                          <div className="flex items-center space-x-2">
                                            <h4
                                              className={`font-semibold transition-colors ${
                                                isCompleted
                                                  ? "text-emerald-700"
                                                  : "text-slate-900 group-hover:text-emerald-600"
                                              }`}
                                            >
                                              {lesson.title}
                                            </h4>
                                            {isCompleted && (
                                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                                                Completed
                                              </span>
                                            )}
                                          </div>
                                          {lesson.description && (
                                            <p
                                              className={`mt-2 leading-relaxed ${"text-slate-600"}`}
                                            >
                                              {lesson.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-3 ml-4">
                                      {lesson.videoUrl && (
                                        <div
                                          className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
                                            isCompleted
                                              ? "text-emerald-600 bg-emerald-50"
                                              : "text-emerald-600 bg-emerald-50"
                                          }`}
                                        >
                                          <FiPlay className="w-4 h-4" />
                                          <span className="text-sm font-medium">
                                            Video
                                          </span>
                                        </div>
                                      )}

                                      {isEnrolled && (
                                        <button
                                          className={`p-2 rounded-lg transition-colors ${
                                            isCompleted
                                              ? "text-emerald-600 hover:bg-emerald-100"
                                              : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                          }`}
                                        >
                                          <FiPlayCircle className="w-5 h-5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="text-center py-16">
                          <FiBook className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                          <p className="text-slate-500 text-lg">
                            No lessons available yet.
                          </p>
                          <p className="text-slate-400">
                            Check back soon for course content.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">
                      Student Reviews
                    </h3>
                    <div className="text-center py-16">
                      <FiStar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 text-lg">No reviews yet</p>
                      <p className="text-slate-400">
                        Be the first to review this course!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-6">
              {/* Course Preview */}
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                {course.coverPhotoUrl ? (
                  <Image
                    src={course.coverPhotoUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button className="bg-white/20 backdrop-blur-sm p-4 rounded-full text-white hover:bg-white/30 transition-colors">
                    <FiPlay className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {/* Enrollment Status */}
                {isEnrolled ? (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-slate-600">
                        Your Progress
                      </span>
                      <span className="text-sm font-bold text-emerald-600">
                        {course?.lessons?.length
                          ? Math.round(
                              (enrollment?.lessonCompletions.length ||
                                0 / course.lessons.length) * 100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full h-2 transition-all duration-500"
                        style={{
                          width: course?.lessons?.length
                            ? `${enrollment?.progressPercentage || 0}%`
                            : "0%",
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>
                        {enrollment?.lessonCompletions.length || 0} lessons
                        completed
                      </span>
                      <span>
                        {(course?.lessons?.length || 0) -
                          (enrollment?.lessonCompletions.length || 0)}{" "}
                        remaining
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-slate-900 mb-2">
                        {course.price ? `${course.price}` : "Free"}
                      </div>
                      {course.price && (
                        <p className="text-slate-500 text-sm">
                          One-time payment
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Action Button */}
                <button
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 ${buttonConfig.className} shadow-lg mb-6`}
                  onClick={() =>
                    handleButtonAction({
                      course,
                      user,
                      isTeacher,
                      isEnrolled,
                      router,
                      showToast,
                      enrollmentId: Number(enrollmentId),
                    })
                  }
                  disabled={buttonConfig.disabled}
                >
                  {isEnrolled ? "Continue Learning" : buttonConfig.text}
                </button>

                {/* Quick Stats for Enrolled Students */}
                {isEnrolled && (
                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
                    <div className="text-center">
                      <div className="text-xl font-bold text-slate-900">
                        {enrollment?.lessonCompletions.length || 0}
                      </div>
                      <div className="text-xs text-slate-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-slate-900">
                        {enrollment?.createdAt
                          ? Math.ceil(
                              (new Date().getTime() -
                                new Date(enrollment.createdAt).getTime()) /
                                (1000 * 3600 * 24)
                            )
                          : 0}
                      </div>
                      <div className="text-xs text-slate-600">
                        Days enrolled
                      </div>
                    </div>
                  </div>
                )}

                {/* Course Features */}
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="font-semibold text-slate-900 mb-4">
                    {isEnrolled ? "Your benefits:" : "This course includes:"}
                  </h4>
                  <ul className="space-y-4">
                    {[
                      { icon: FiClock, text: "Lifetime access" },
                      { icon: FiAward, text: "Certificate of completion" },
                      {
                        icon: FiBook,
                        text: `${course.lessons?.length || 0} lessons`,
                      },
                      { icon: FiDownload, text: "Downloadable resources" },
                      { icon: FiUsers, text: "Community access" },
                    ].map(({ icon: Icon, text }, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-3 text-slate-600"
                      >
                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                          <Icon className="text-emerald-600 w-4 h-4" />
                        </div>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
