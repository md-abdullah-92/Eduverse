"use client";

import { useAuth } from "@/app/auth/context";
import { ErrorDisplay } from "@/components/ui_elements/ErrorDisplay";
import { EnrollmentUtils } from "@/utils/enrollmentUtils";
import { Enrollment, Lesson } from "@/utils/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiBook,
  FiBookOpen,
  FiCheckCircle,
  FiFileText,
  FiMaximize,
  FiMenu,
  FiPause,
  FiPlay,
  FiSkipBack,
  FiSkipForward,
  FiVideo,
  FiVolume2,
  FiX,
} from "react-icons/fi";

interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

interface LessonProgress {
  [lessonId: string]: {
    completed: boolean;
    watchTime: number;
    lastWatched: Date;
  };
}

interface NavigationButtonProps {
  direction: "previous" | "next";
  lesson: Lesson | null;
  onLessonChange: (lesson: Lesson) => void;
  disabled: boolean;
  className?: string;
  compact?: boolean;
}

// Dummy video URLs for testing (you can remove these when real videos are added)
const DEMO_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
];

// Reusable Navigation Button Component
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

export default function LearnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const completedLessonsRef = useRef<Record<string, boolean>>({});

  // State
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [lessonProgress, setLessonProgress] = useState<LessonProgress>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [videoState, setVideoState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
  });

  const enrollmentId = searchParams.get("enrolled");

  // Memoized sorted lessons to avoid repeated sorting
  const sortedLessons = useMemo(() => {
    return (
      enrollment?.course.lessons?.sort((a, b) => a.orderIndex - b.orderIndex) ||
      []
    );
  }, [enrollment?.course.lessons]);

  // Memoized navigation lessons
  const { nextLesson, previousLesson, currentLessonIndex } = useMemo(() => {
    if (!currentLesson || sortedLessons.length === 0) {
      return { nextLesson: null, previousLesson: null, currentLessonIndex: 0 };
    }

    const currentIndex = sortedLessons.findIndex(
      (l) => l.id === currentLesson.id
    );

    return {
      nextLesson:
        currentIndex < sortedLessons.length - 1
          ? sortedLessons[currentIndex + 1]
          : null,
      previousLesson: currentIndex > 0 ? sortedLessons[currentIndex - 1] : null,
      currentLessonIndex: currentIndex,
    };
  }, [currentLesson, sortedLessons]);

  // Calculate course progress from enrollment
  const courseProgress = enrollment?.progressPercentage || 0;

  // Get demo video URL for testing (remove this when real videos are available)
  const getDemoVideoUrl = useCallback((lessonIndex: number) => {
    return DEMO_VIDEOS[lessonIndex % DEMO_VIDEOS.length];
  }, []);

  // Fetch enrollment data and set first lesson
  useEffect(() => {
    if (!user?.id || !enrollmentId) return;

    const enrollmentUtils = new EnrollmentUtils({
      userId: user.id,
    });

    const fetchEnrollment = async () => {
      try {
        const enrollmentData = await enrollmentUtils.fetchEnrollment(
          Number(enrollmentId)
        );
        setEnrollment(enrollmentData);

        // Set first lesson as current
        if (
          enrollmentData.course.lessons &&
          enrollmentData.course.lessons.length > 0
        ) {
          const firstLesson = enrollmentData.course.lessons.sort(
            (a, b) => a.orderIndex - b.orderIndex
          )[0];
          setCurrentLesson(firstLesson);
        }

        // Initialize lesson progress from lesson completions
        const progressMap: LessonProgress = {};
        enrollmentData.lessonCompletions?.forEach((completion) => {
          progressMap[completion.lessonId] = {
            completed: completion.completedAt !== null,
            watchTime: 0,
            lastWatched: completion.completedAt || new Date(),
          };
        });
        setLessonProgress(progressMap);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load enrollment"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollment();
  }, [enrollmentId, user?.id, refreshTrigger]);

  // Video event handlers
  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoState.isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [videoState.isPlaying]);

  const handleVideoTimeUpdate = useCallback(() => {
    if (!videoRef.current || !currentLesson?.id) return;

    const { currentTime, duration } = videoRef.current;
    setVideoState((prev) => ({
      ...prev,
      currentTime,
      duration,
    }));

    // Update lesson progress
    const isCompleted = currentTime / duration > 0.9;

    // Only proceed if it's not already marked as completed
    if (!completedLessonsRef.current[currentLesson.id]) {
      setLessonProgress((prev) => ({
        ...prev,
        [currentLesson.id!]: {
          ...prev[currentLesson.id!],
          watchTime: currentTime,
          lastWatched: new Date(),
          completed: isCompleted,
        },
      }));

      // Mark lesson completion in backend
      if (isCompleted && user?.id && enrollmentId) {
        // Mark as completed in ref to prevent duplicate calls
        completedLessonsRef.current[currentLesson.id] = true;

        const enrollmentUtils = new EnrollmentUtils({
          userId: user.id,
        });
        enrollmentUtils.markLessonCompleted(
          Number(currentLesson.id),
          Number(enrollmentId)
        );
        setRefreshTrigger((prev) => prev + 1);
      }
    }
  }, [currentLesson?.id, user?.id, enrollmentId]);

  const handleProgressBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (progressBarRef.current && videoRef.current && videoState.duration) {
        const rect = progressBarRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * videoState.duration;

        videoRef.current.currentTime = newTime;
        setVideoState((prev) => ({ ...prev, currentTime: newTime }));
      }
    },
    [videoState.duration]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      if (videoRef.current) {
        videoRef.current.volume = newVolume;
        setVideoState((prev) => ({ ...prev, volume: newVolume }));
      }
    },
    []
  );

  const handleFullscreen = useCallback(() => {
    if (playerContainerRef.current) {
      if (!document.fullscreenElement) {
        playerContainerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  }, []);

  const handleLessonChange = useCallback((lesson: Lesson) => {
    setCurrentLesson(lesson);
    setVideoState((prev) => ({ ...prev, currentTime: 0, isPlaying: false }));
  }, []);

  const formatTime = useCallback((seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <ErrorDisplay
        error={error}
        title="Course Not Found"
        description="We couldn't find the course you're looking for."
      />
    );
  } else if (!currentLesson) {
    return (
      <ErrorDisplay
        error={error}
        title="No Lesson Found"
        description="We couldn't find the lesson you're looking for."
      />
    );
  }

  const course = enrollment.course;

  // Check if current lesson has video (for demo, we'll use demo videos)
  const hasVideo = currentLesson.videoUrl || true; // Set to true for demo
  const videoUrl =
    currentLesson.videoUrl || getDemoVideoUrl(currentLessonIndex);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Learning Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() =>
                  router.push(`/courses/${course.id}?enrolled=${enrollment.id}`)
                }
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FiArrowLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FiMenu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                {course.title}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 text-sm text-gray-600">
                <span>{Math.round(courseProgress)}% Complete</span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 transition-all duration-300"
                    style={{ width: `${courseProgress}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`p-2 rounded-lg transition-colors ${
                  showNotes
                    ? "bg-teal-100 text-teal-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FiFileText className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6 py-6">
          {/* Sidebar - Lesson List */}
          <div
            className={`${
              sidebarOpen ? "w-80" : "w-0"
            } transition-all duration-300 overflow-hidden flex-shrink-0 lg:block ${
              sidebarOpen ? "block" : "hidden"
            }`}
          >
            <div className="bg-white rounded-lg border border-gray-200 h-fit sticky top-24">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">
                    Course Content
                  </h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {
                    Object.values(lessonProgress).filter((p) => p.completed)
                      .length
                  }{" "}
                  of {sortedLessons.length} lessons completed
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {sortedLessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonChange(lesson)}
                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      currentLesson.id === lesson.id
                        ? "bg-teal-50 border-l-4 border-l-teal-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {lessonProgress[lesson.id!]?.completed ? (
                          <FiCheckCircle className="h-4 w-4 text-green-500" />
                        ) : currentLesson.id === lesson.id ? (
                          <div className="h-4 w-4 rounded-full bg-teal-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-teal-600 mb-1 font-medium">
                          Lesson {index + 1}
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                          {lesson.title}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <FiVideo className="h-3 w-3 mr-1" />
                          <span>
                            {lesson.videoUrl ? "Video" : "Video (Demo)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
              {/* Video Player */}
              <div ref={playerContainerRef} className="relative bg-black">
                {hasVideo ? (
                  <div className="relative">
                    {/* Demo Notice */}
                    {!currentLesson.videoUrl && (
                      <div className="absolute top-4 left-4 z-10">
                        <div className="bg-yellow-500 text-black px-3 py-1 rounded-md text-sm font-medium">
                          Demo Video
                        </div>
                      </div>
                    )}

                    <video
                      ref={videoRef}
                      className="w-full aspect-video"
                      onTimeUpdate={handleVideoTimeUpdate}
                      onPlay={() =>
                        setVideoState((prev) => ({ ...prev, isPlaying: true }))
                      }
                      onPause={() =>
                        setVideoState((prev) => ({ ...prev, isPlaying: false }))
                      }
                      onLoadedMetadata={() => {
                        if (videoRef.current) {
                          setVideoState((prev) => ({
                            ...prev,
                            duration: videoRef.current!.duration,
                          }));
                        }
                      }}
                    >
                      <source src={videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>

                    {/* Video Controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handlePlayPause}
                          className="text-white hover:text-teal-400 transition-colors"
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
                            {formatTime(videoState.currentTime)}
                          </span>
                          <div
                            ref={progressBarRef}
                            className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden cursor-pointer"
                            onClick={handleProgressBarClick}
                          >
                            <div
                              className="h-full bg-teal-500 transition-all duration-150"
                              style={{
                                width: `${
                                  (videoState.currentTime /
                                    videoState.duration) *
                                    100 || 0
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-white">
                            {formatTime(videoState.duration)}
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
                          onClick={handleFullscreen}
                          className="text-white hover:text-teal-400 transition-colors"
                        >
                          <FiMaximize className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <FiBook className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Video will be available soon
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        This lesson is currently text-based
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lesson Content */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentLesson.title}
                </h1>
                {currentLesson.description && (
                  <p className="text-gray-600">{currentLesson.description}</p>
                )}
              </div>

              {/* Lesson Notes */}
              {currentLesson.notes && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiBookOpen className="mr-2 text-teal-600" />
                    Lesson Notes
                  </h2>
                  <div className="prose prose-gray max-w-none">
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <p className="whitespace-pre-wrap text-gray-700">
                        {currentLesson.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
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

          {/* Notes Panel */}
          {showNotes && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 h-fit sticky top-24">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">My Notes</h3>
                  <button
                    onClick={() => setShowNotes(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Take notes for this lesson..."
                    className="w-full h-64 resize-none border border-gray-200 rounded-lg p-3 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button className="mt-3 w-full px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors">
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
