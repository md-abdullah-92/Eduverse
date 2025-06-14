/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@/app/auth/context";
import ChatWidget from "@/app/lesson/ChatWidget";
import Sidebar from "@/app/students/components/Sidebar";
import { ErrorDisplay } from "@/components/ui_elements/ErrorDisplay";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { poppins } from "@/utils/font";
import { Lesson } from "@/utils/types";
import { useRouter, useSearchParams } from "next/navigation";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";

import {
  FiArrowLeft,
  FiAward,
  FiBook,
  FiBookOpen,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiEdit3,
  FiLoader,
  FiMaximize,
  FiMenu,
  FiPause,
  FiPlay,
  FiSkipBack,
  FiSkipForward,
  FiVideo,
  FiVolume2,
} from "react-icons/fi";
import { VideoUtils } from "../learn/utils/videoUtils";

// Import custom hooks
import LoadingIndicator from "@/components/ui_elements/loadingIndicator";
import { useEnrollmentData } from "../learn/hooks/useEnrollmentData";
import { useLessonNavigation } from "../learn/hooks/useLessonNavigation";
import { useLessonProgress } from "../learn/hooks/useLessonProgress";
import { useVideoPlayer } from "../learn/hooks/useVideoPlayer";

interface NavigationButtonProps {
  direction: "previous" | "next";
  lesson: Lesson | null;
  onLessonChange: (lesson: Lesson) => void;
  disabled: boolean;
  className?: string;
  compact?: boolean;
}

const NavigationButton: React.FC<NavigationButtonProps> = ({
  direction,
  lesson,
  onLessonChange,
  disabled,
  className = "",
  compact = false,
}) => {
  const isPrevious = direction === "previous";
  const baseClasses = disabled
    ? "disabled:opacity-50 disabled:cursor-not-allowed"
    : "";

  const handleClick = () => {
    if (lesson && !disabled) {
      onLessonChange(lesson);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`text-white hover:text-teal-400 transition-colors ${baseClasses} ${className}`}
      >
        {isPrevious ? (
          <FiSkipBack className="h-5 w-5" />
        ) : (
          <FiSkipForward className="h-5 w-5" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${baseClasses} ${className}`}
    >
      {isPrevious && <FiSkipBack className="h-4 w-4" />}
      <span>{isPrevious ? "Previous Lesson" : "Next Lesson"}</span>
      {!isPrevious && <FiSkipForward className="h-4 w-4" />}
    </button>
  );
};

interface LessonStatusProps {
  lesson: Lesson;
  progress: any;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

const LessonStatus: React.FC<LessonStatusProps> = ({
  lesson,
  progress,
  isActive,
  onClick,
  index,
}) => {
  const hasVideo = !!lesson.videoUrl;
  const isCompleted = progress?.completed || false;
  const videoProgress = progress?.watchPercentage || 0;
  const quizCompleted = progress?.quizCompleted || false;
  const quizScore = progress?.quizScore || 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-all duration-200 ${
        isActive ? "bg-teal-50 border-l-4 border-l-teal-500" : ""
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {isCompleted ? (
            <div className="relative">
              <FiCheckCircle className="h-5 w-5 text-green-500" />
              <div className="absolute -top-1 -right-1">
                <FiAward className="h-3 w-3 text-yellow-500" />
              </div>
            </div>
          ) : isActive ? (
            <div className="h-5 w-5 rounded-full bg-teal-500 animate-pulse" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-teal-600 mb-1 font-medium">
            Lesson {index + 1}
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
            {lesson.title}
          </h3>

          {/* Progress indicators */}
          <div className="space-y-1">
            {hasVideo && (
              <div className="flex items-center text-xs text-gray-500">
                <FiVideo className="h-3 w-3 mr-1" />
                <span className="mr-2">Video</span>
                {videoProgress > 0 && (
                  <div className="flex items-center">
                    <FiClock className="h-3 w-3 mr-1" />
                    <span>{Math.round(videoProgress)}%</span>
                  </div>
                )}
              </div>
            )}

            {!hasVideo && (
              <div className="flex items-center text-xs text-gray-500">
                <FiBook className="h-3 w-3 mr-1" />
                <span>Text</span>
              </div>
            )}

            {quizCompleted && (
              <div className="flex items-center text-xs">
                <FiClipboard className="h-3 w-3 mr-1" />
                <span
                  className={
                    quizScore >= 60 ? "text-green-600" : "text-red-600"
                  }
                >
                  Quiz: {quizScore}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

export default function LearnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // State
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState<
    "notes" | "assignments" | null
  >(null);

  const userID = localStorage.getItem("userId");
  const { profile } = useStudentProfile(userID);
  const enrollmentId = searchParams.get("enrolled");

  // Custom Hooks
  const { enrollment, loading, error, refetch } = useEnrollmentData({
    userId: user?.id || "",
    enrollmentId: enrollmentId || "",
  });

  const { videoState, videoError, controls, eventHandlers } = useVideoPlayer({
    videoRef: videoRef as RefObject<HTMLVideoElement>,
    onTimeUpdate: (currentTime, duration) => {
      if (currentLesson?.id) {
        updateProgress(
          currentLesson.id.toString() || "",
          currentTime,
          duration
        );
      }
    },
    onError: (error) => console.error("Video error:", error),
  });

  const {
    lessonProgress,
    updateProgress,
    markQuizCompleted,
    getCompletionStats,
  } = useLessonProgress({
    enrollment,
    userId: user?.id || "",
    onProgressUpdate: refetch,
  });

  const { sortedLessons, nextLesson, previousLesson } = useLessonNavigation({
    lessons: enrollment?.course.lessons || [],
    currentLesson,
  });

  // Set first lesson when enrollment loads
  useEffect(() => {
    if (enrollment && sortedLessons.length > 0 && !currentLesson) {
      setCurrentLesson(sortedLessons[0]);
    }
  }, [enrollment, sortedLessons, currentLesson]);

  // Reset video when lesson changes
  useEffect(() => {
    if (currentLesson?.id) {
      controls.resetState();
    }
  }, [currentLesson?.id]);

  // Update quiz completion status from profile
  useEffect(() => {
    if (!currentLesson?.id || !profile?.quizResults) return;

    const quizResult = profile.quizResults.find(
      (result: any) => result.lessonId === currentLesson.id!.toString()
    );

    if (quizResult && quizResult.score !== undefined) {
      markQuizCompleted(currentLesson.id!.toString(), quizResult.score);
    }
  }, [currentLesson?.id, profile?.quizResults, markQuizCompleted]);

  // Event Handlers
  const handleProgressBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (progressBarRef.current && videoState.duration) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * videoState.duration;
        controls.seek(newTime);
      }
    },
    [videoState.duration, controls]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      controls.setVolume(newVolume);
    },
    [controls]
  );

  const handleLessonChange = useCallback(
    (lesson: Lesson) => {
      if (videoRef.current && !videoRef.current.paused) {
        controls.pause();
      }
      setCurrentLesson(lesson);
    },
    [controls]
  );

  const handleStartQuiz = useCallback(() => {
    if (!currentLesson?.id) return;

    setIsLoading(true); // Start loading
    const lessonId = currentLesson.id;
    const userId = localStorage.getItem("userId");

    const attemptedQuiz = profile?.quizResults?.find(
      (result) => result.lessonId === lessonId
    );

    if (attemptedQuiz) {
      router.push(`/students/${userId}/quiz/${attemptedQuiz.id}`);
    } else {
      router.push(`/lesson/${lessonId}/quizes`);
    }

    // DO NOT set isLoading(false) here
  }, [currentLesson?.id, profile?.quizResults, router]);

  const formatTime = useCallback((seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Loading state
  if (loading) {
    return <LoadingIndicator />;
  }

  if (error || !enrollment) {
    return (
      <ErrorDisplay
        error={error}
        title="Course Not Found"
        description="We couldn't find the course you're looking for."
      />
    );
  }

  if (!currentLesson) {
    return (
      <ErrorDisplay
        error={error}
        title="No Lesson Found"
        description="We couldn't find the lesson you're looking for."
      />
    );
  }

  const course = enrollment.course;
  const hasVideo = !!currentLesson.videoUrl;
  const completionStats = getCompletionStats();
  const currentProgress = lessonProgress[currentLesson.id!.toString()];

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 relative overflow-hidden pb-20 ${poppins.className}`}
    >
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg fixed left-0 top-0 h-full z-40">
        <div className="p-6">
          <Sidebar userId={user?.id || ""} role={user?.role || "STUDENT"} />
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <ChatWidget />

      {/* Main Content Area */}
      <main className="flex-1 ml-90">
        {/* Learning Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FiMenu className="h-5 w-5" />
                </button>
                <button
                  onClick={() =>
                    router.push(
                      `/courses/${course.id}?enrolled=${enrollment.id}`
                    )
                  }
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <FiArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                  {course.title}
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-3 text-sm text-gray-600">
                  <span>{completionStats.completionPercentage}% Complete</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 transition-all duration-300"
                      style={{
                        width: `${completionStats.completionPercentage}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content with Course Sidebar on Right */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 min-w-0 p-6 overflow-y-auto">
            <div className="bg-white rounded-lg border border-teal-300 overflow-hidden mb-6">
              {/* Video Player */}
              <div ref={playerContainerRef} className="relative bg-black">
                {hasVideo ? (
                  <div className="relative">
                    {videoError ? (
                      <div className="aspect-video flex items-center justify-center bg-red-50">
                        <div className="text-center">
                          <FiVideo className="h-16 w-16 text-red-400 mx-auto mb-4" />
                          <p className="text-red-600 font-medium">
                            Video Error
                          </p>
                          <p className="text-sm text-red-500 mt-2 max-w-md">
                            {videoError}
                          </p>
                          <button
                            onClick={() => controls.resetState()}
                            className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Retry
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Loading overlay */}
                        {videoState.isLoading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                          </div>
                        )}

                        <video
                          ref={videoRef}
                          key={currentLesson.id}
                          className="w-full aspect-video"
                          {...eventHandlers}
                          preload="metadata"
                        >
                          <source
                            src={currentLesson.videoUrl!}
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>

                        {/* Video Controls */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={
                                videoState.isPlaying
                                  ? controls.pause
                                  : controls.play
                              }
                              disabled={videoState.isLoading}
                              className="text-white hover:text-teal-400 transition-colors disabled:opacity-50"
                            >
                              {videoState.isPlaying ? (
                                <FiPause className="h-6 w-6" />
                              ) : (
                                <FiPlay className="h-6 w-6" />
                              )}
                            </button>

                            <NavigationButton
                              direction="previous"
                              lesson={previousLesson}
                              onLessonChange={handleLessonChange}
                              disabled={!previousLesson}
                              compact
                            />

                            <NavigationButton
                              direction="next"
                              lesson={nextLesson}
                              onLessonChange={handleLessonChange}
                              disabled={!nextLesson}
                              compact
                            />

                            <div className="flex-1 flex items-center space-x-2">
                              <span className="text-sm text-white">
                                {VideoUtils.formatTime(videoState.currentTime)}
                              </span>
                              <div
                                ref={progressBarRef}
                                className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden cursor-pointer"
                                onClick={handleProgressBarClick}
                              >
                                <div
                                  className="h-full bg-teal-500 transition-all duration-150"
                                  style={{
                                    width: `${VideoUtils.calculateProgress(
                                      videoState.currentTime,
                                      videoState.duration
                                    )}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-white">
                                {VideoUtils.formatTime(videoState.duration)}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <FiVolume2 className="h-5 w-5 text-white" />
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={videoState.volume}
                                onChange={handleVolumeChange}
                                className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>

                            <button
                              onClick={() =>
                                controls.toggleFullscreen(playerContainerRef)
                              }
                              className="text-white hover:text-teal-400 transition-colors"
                            >
                              <FiMaximize className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <FiBook className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">
                        Text-Based Lesson
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        This lesson doesn&apos;t have a video component
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lesson Content */}
            <div className="bg-white rounded-lg border-1 border-teal-300 p-6 mb-6">
              <div className="mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {currentLesson.title}
                    </h1>
                    {currentLesson.description && (
                      <p className="text-gray-600">
                        {currentLesson.description}
                      </p>
                    )}
                  </div>

                  {/* Lesson completion status */}
                  <div className="flex items-center space-x-2 ml-4">
                    {currentProgress?.completed ? (
                      <div className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <FiCheckCircle className="h-4 w-4 mr-1" />
                        Completed
                      </div>
                    ) : (
                      <div className="flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        <FiClock className="h-4 w-4 mr-1" />
                        In Progress
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress indicators */}
                {(hasVideo || currentProgress?.quizCompleted) && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      {hasVideo && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Video Progress:</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-teal-500 transition-all duration-300"
                                style={{
                                  width: `${Math.min(
                                    currentProgress?.watchPercentage || 0,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                            <span
                              className={`font-medium ${
                                (currentProgress?.watchPercentage || 0) >= 90
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {Math.round(
                                currentProgress?.watchPercentage || 0
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      )}

                      {currentProgress?.quizCompleted && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Quiz Score:</span>
                          <span
                            className={`font-medium ${
                              (currentProgress?.quizScore || 0) >= 60
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {currentProgress?.quizScore || 0}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                {/* Notes Button */}
                <button
                  onClick={() => {
                    setLoadingButton("notes");
                    setTimeout(() => {
                      router.push(`/lesson/${currentLesson.id}/notes`);
                    }, 500); // small delay to show loading effect
                  }}
                  disabled={loadingButton !== null}
                  className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    lessonProgress[currentLesson.id!]?.notesViewed
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } ${
                    loadingButton === "notes"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {loadingButton === "notes" ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : lessonProgress[currentLesson.id!]?.notesViewed ? (
                    <>
                      <FiCheckCircle className="w-4 h-4" />
                      Notes Viewed
                    </>
                  ) : (
                    <>
                      <FiBookOpen className="w-4 h-4" />
                      View Notes
                    </>
                  )}
                </button>

                {/* Assignment Button */}
                <button
                  onClick={() => {
                    setLoadingButton("assignments");
                    setTimeout(() => {
                      router.push(`/lesson/${currentLesson.id}/assignments`);
                    }, 500);
                  }}
                  disabled={loadingButton !== null}
                  className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    lessonProgress[currentLesson.id!]?.assignmentCompleted
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } ${
                    loadingButton === "assignments"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {loadingButton === "assignments" ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : lessonProgress[currentLesson.id!]?.assignmentCompleted ? (
                    <>
                      <FiCheckCircle className="w-4 h-4" />
                      Practice Done
                    </>
                  ) : (
                    <>
                      <FiEdit3 className="w-4 h-4" />
                      Practice
                    </>
                  )}
                </button>

                {/* Quiz Button */}
                <button
                  onClick={handleStartQuiz}
                  type="button"
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    lessonProgress[currentLesson.id!]?.quizCompleted
                      ? "bg-green-100 text-green-700 ring-green-200 hover:bg-green-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 ring-gray-300"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : lessonProgress[currentLesson.id!]?.quizCompleted ? (
                    <>
                      <FiCheckCircle className="w-4 h-4" aria-hidden="true" />
                      <span>Quiz Completed</span>
                    </>
                  ) : (
                    <>
                      <FiClipboard className="w-4 h-4" aria-hidden="true" />
                      <span>Start Quiz</span>
                    </>
                  )}
                </button>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
                <NavigationButton
                  direction="previous"
                  lesson={previousLesson}
                  onLessonChange={handleLessonChange}
                  disabled={!previousLesson}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                />

                <NavigationButton
                  direction="next"
                  lesson={nextLesson}
                  onLessonChange={handleLessonChange}
                  disabled={!nextLesson}
                  className="bg-teal-600 text-white hover:bg-teal-700"
                />
              </div>
            </div>
          </div>

          {/* Course Content Sidebar */}
          <div className="w-80 flex-shrink-0 p-6 pl-0 overflow-y-auto">
            <div className="bg-white rounded-lg border-1 border-teal-200 h-full flex flex-col sticky top-24">
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="font-semibold text-gray-900">Course Content</h2>
                <div className="mt-2 text-xs text-gray-500">
                  {completionStats.completedLessons} of{" "}
                  {completionStats.totalLessons} lessons completed
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {sortedLessons.map((lesson, index) => (
                  <LessonStatus
                    key={lesson.id}
                    lesson={lesson}
                    progress={lessonProgress[lesson.id!]}
                    isActive={currentLesson.id === lesson.id}
                    onClick={() => handleLessonChange(lesson)}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
