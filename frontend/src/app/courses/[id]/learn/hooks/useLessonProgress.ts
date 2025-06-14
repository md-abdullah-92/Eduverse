import { EnrollmentUtils } from "@/utils/enrollmentUtils";
import { Enrollment } from "@/utils/types";
import { useCallback, useEffect, useRef, useState } from "react";

interface LessonProgress {
  [lessonId: string]: {
    completed: boolean;
    watchTime: number;
    watchPercentage: number;
    videoCompleted: boolean;
    lastWatched: Date;
    quizCompleted: boolean;
    quizScore?: number;
  };
}

interface UseLessonProgressProps {
  enrollment: Enrollment | null;
  userId: string;
  onProgressUpdate?: () => void;
}

export function useLessonProgress({
  enrollment,
  userId,
  onProgressUpdate,
}: UseLessonProgressProps) {
  const [lessonProgress, setLessonProgress] = useState<LessonProgress>({});
  const completedLessonsRef = useRef<Record<string, boolean>>({});
  const enrollmentUtilsRef = useRef<EnrollmentUtils | null>(null);

  // Initialize enrollment utils
  useEffect(() => {
    if (userId) {
      enrollmentUtilsRef.current = new EnrollmentUtils({ userId });
    }
  }, [userId]);

  // Initialize progress from enrollment data
  useEffect(() => {
    if (!enrollment) return;

    const progressMap: LessonProgress = {};

    // Initialize with default values for all lessons
    enrollment.course.lessons?.forEach((lesson) => {
      progressMap[lesson.id!] = {
        completed: false,
        watchTime: 0,
        watchPercentage: 0,
        videoCompleted: false,
        lastWatched: new Date(),
        quizCompleted: false,
      };
    });

    // Update with actual completion data
    enrollment.lessonCompletions?.forEach((completion) => {
      if (progressMap[completion.lessonId]) {
        progressMap[completion.lessonId] = {
          ...progressMap[completion.lessonId],
          completed: completion.completedAt !== null,
          lastWatched: completion.completedAt || new Date(),
        };
      }
    });

    setLessonProgress(progressMap);
  }, [enrollment]);

  // Check if lesson should be marked as completed
  const checkLessonCompletion = useCallback(
    (lessonId: string, hasVideo: boolean) => {
      const progress = lessonProgress[lessonId];
      if (!progress) return false;

      // For lessons with video: both video (90%+) and quiz (60%+) must be completed
      if (hasVideo) {
        return (
          progress.videoCompleted &&
          progress.quizCompleted &&
          (progress.quizScore || 0) >= 60
        );
      }

      // For text-only lessons: only quiz (60%+) needs to be completed
      return progress.quizCompleted && (progress.quizScore || 0) >= 60;
    },
    [lessonProgress]
  );

  const updateProgress = useCallback(
    (lessonId: string, currentTime: number, duration: number) => {
      if (!lessonId || !duration || duration === 0) return;

      const watchPercentage = (currentTime / duration) * 100;
      const videoCompleted = watchPercentage >= 90;

      setLessonProgress((prev) => {
        const updated = {
          ...prev,
          [lessonId]: {
            ...prev[lessonId],
            watchTime: currentTime,
            watchPercentage,
            videoCompleted,
            lastWatched: new Date(),
          },
        };

        // Check if lesson should be completed after video progress update
        const lesson = enrollment?.course.lessons?.find(
          (l) => l.id === Number(lessonId)
        );
        const hasVideo = !!lesson?.videoUrl;
        const shouldComplete = checkLessonCompletion(lessonId, hasVideo);

        if (shouldComplete) {
          updated[lessonId].completed = true;
        }

        return updated;
      });

      // Mark completion in backend if criteria met and not already marked
      if (
        videoCompleted &&
        !completedLessonsRef.current[lessonId] &&
        enrollment
      ) {
        const lesson = enrollment.course.lessons?.find(
          (l) => l.id === Number(lessonId)
        );
        const hasVideo = !!lesson?.videoUrl;

        if (checkLessonCompletion(lessonId, hasVideo)) {
          completedLessonsRef.current[lessonId] = true;
          enrollmentUtilsRef.current?.markLessonCompleted(
            Number(lessonId),
            enrollment.id
          );
          onProgressUpdate?.();
        }
      }
    },
    [enrollment, checkLessonCompletion, onProgressUpdate]
  );

  const markQuizCompleted = useCallback(
    (lessonId: string, score: number) => {
      const quizCompleted = score >= 60;

      setLessonProgress((prev) => {
        const updated = {
          ...prev,
          [lessonId]: {
            ...prev[lessonId],
            quizCompleted,
            quizScore: score,
          },
        };

        // Check if lesson should be completed after quiz completion
        const lesson = enrollment?.course.lessons?.find(
          (l) => l.id === Number(lessonId)
        );
        const hasVideo = !!lesson?.videoUrl;

        // For lessons with video: check if video is also completed
        // For text-only lessons: quiz completion is sufficient
        const shouldComplete = hasVideo
          ? updated[lessonId].videoCompleted && quizCompleted
          : quizCompleted;

        if (shouldComplete) {
          updated[lessonId].completed = true;

          // Mark completion in backend if not already marked
          if (!completedLessonsRef.current[lessonId] && enrollment) {
            completedLessonsRef.current[lessonId] = true;
            enrollmentUtilsRef.current?.markLessonCompleted(
              Number(lessonId),
              enrollment.id
            );
            onProgressUpdate?.();
          }
        }

        return updated;
      });
    },
    [enrollment, onProgressUpdate]
  );

  // Get completion statistics
  const getCompletionStats = useCallback(() => {
    const totalLessons = enrollment?.course.lessons?.length || 0;
    const completedLessons = Object.values(lessonProgress).filter(
      (p) => p.completed
    ).length;
    const completionPercentage =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      totalLessons,
      completedLessons,
      completionPercentage: Math.round(completionPercentage),
    };
  }, [lessonProgress, enrollment]);

  return {
    lessonProgress,
    updateProgress,
    markQuizCompleted,
    getCompletionStats,
  };
}
