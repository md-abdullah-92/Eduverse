import { Lesson } from "@/utils/types";
import { useMemo } from "react";

interface UseLessonNavigationProps {
  lessons: Lesson[];
  currentLesson: Lesson | null;
}

export function useLessonNavigation({
  lessons,
  currentLesson,
}: UseLessonNavigationProps) {
  const sortedLessons = useMemo(() => {
    return lessons.sort((a, b) => a.orderIndex - b.orderIndex);
  }, [lessons]);

  const { nextLesson, previousLesson, currentIndex } = useMemo(() => {
    if (!currentLesson || sortedLessons.length === 0) {
      return { nextLesson: null, previousLesson: null, currentIndex: -1 };
    }

    const index = sortedLessons.findIndex((l) => l.id === currentLesson.id);

    return {
      nextLesson:
        index < sortedLessons.length - 1 ? sortedLessons[index + 1] : null,
      previousLesson: index > 0 ? sortedLessons[index - 1] : null,
      currentIndex: index,
    };
  }, [currentLesson, sortedLessons]);

  return {
    sortedLessons,
    nextLesson,
    previousLesson,
    currentIndex,
  };
}
