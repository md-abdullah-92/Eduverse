/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

// Define proper interfaces for better type safety
import { CourseUtils } from "@/utils/courseUtils";
import { CourseData, Lesson } from "@/utils/types";

interface UseCourseProps {
  courseId: string;
  instructorId: string;
}

const INITIAL_COURSE_DATA: CourseData = {
  id: "",
  title: "",
  price: "0.00",
  level: "",
  topic: "",
  description: "",
  coverPhotoUrl: null,
  instructorId: "",
  averageRating: 0.0,
  outcomes: [""],
  lessons: [],
};

const INITIAL_LESSON_DATA: Lesson = {
  id: "",
  title: "",
  description: "",
  notes: "",
  videoUrl: "",
  orderIndex: 0,
};

export function useCourse({ courseId, instructorId }: UseCourseProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [courseData, setCourseData] = useState<CourseData>(INITIAL_COURSE_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  // Changed from array to single object
  const [currentLesson, setCurrentLesson] =
    useState<Lesson>(INITIAL_LESSON_DATA);

  // Form validation
  const [lessonErrors, setLessonErrors] = useState<Record<string, string>>({});

  const courseUtils = useMemo(
    () => new CourseUtils({ courseId, userId: instructorId }),
    [courseId, instructorId]
  );

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const courseData = await courseUtils.fetchCourseDetails();
        setCourseData(courseData);
        setCoverPreview(courseData.coverPhotoUrl);
      } catch (err) {
        console.error("Error fetching course details:", err);
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(errorMsg);
        showToast(errorMsg, "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId, courseUtils, showToast]);

  // Update course field handlers
  const updateCourseField = useCallback(
    <K extends keyof CourseData>(field: K, value: CourseData[K]) => {
      if (field === "price") {
        if (value === null || value === undefined) {
          setCourseData((prev) => ({ ...prev, price: "0.00" }));
          return;
        }
        if (
          typeof value === "string" &&
          (value === "" || /^[0-9]*[.,]?[0-9]*$/.test(value))
        ) {
          const formattedPrice = value.replace(",", ".");
          setCourseData((prev) => ({
            ...prev,
            price: formattedPrice,
          }));
        }
      } else {
        setCourseData((prev) => ({ ...prev, [field]: value }));
      }
    },
    []
  );

  // Learning outcomes handlers
  const outcomeHandlers = {
    add: useCallback(() => {
      updateCourseField("outcomes", [...courseData.outcomes, ""]);
    }, [courseData.outcomes, updateCourseField]),

    update: useCallback(
      (index: number, value: string) => {
        const updatedOutcomes = [...courseData.outcomes];
        updatedOutcomes[index] = value;
        updateCourseField("outcomes", updatedOutcomes);
      },
      [courseData.outcomes, updateCourseField]
    ),

    remove: useCallback(
      (index: number) => {
        const updatedOutcomes = courseData.outcomes.filter(
          (_, i) => i !== index
        );
        updateCourseField("outcomes", updatedOutcomes);
      },
      [courseData.outcomes, updateCourseField]
    ),
  };

  // Reset lesson form
  const resetLessonForm = useCallback(() => {
    setCurrentLesson(INITIAL_LESSON_DATA);
    setEditingLessonId(null);
    setLessonErrors({});
    setShowLessonModal(false);
  }, []);

  // Validate lesson data
  const validateLesson = useCallback(
    (lessonData: Lesson): Record<string, string> => {
      const errors: Record<string, string> = {};

      if (!lessonData.title.trim()) {
        errors.title = "Lesson title is required";
      }

      if (!lessonData.description.trim()) {
        errors.description = "Lesson description is required";
      }

      return errors;
    },
    []
  );

  // Update lesson order after drag and drop
  const updateLessonOrder = useCallback(
    (reorderedLessons: Lesson[]) => {
      // Update the orderIndex for all lessons
      const updatedLessons = reorderedLessons.map((lesson, index) => ({
        ...lesson,
        orderIndex: index,
      }));

      updateCourseField("lessons", updatedLessons);
    },
    [updateCourseField]
  );

  // Lesson form handlers
  const lessonHandlers = {
    // Update the current lesson being edited
    change: useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentLesson((prev) => ({ ...prev, [name]: value }));

        // Clear error for this field if it exists
        if (lessonErrors[name]) {
          setLessonErrors((prev) => ({ ...prev, [name]: "" }));
        }
      },
      [lessonErrors]
    ),

    videoChange: useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      // Placeholder for video handling
      // Will be implemented later
    }, []),

    // Load lesson data into form for editing
    edit: useCallback(
      (lessonId: string) => {
        const lessonToEdit = courseData.lessons.find(
          (lesson) => lesson.id === lessonId
        );

        if (lessonToEdit) {
          setCurrentLesson({
            id: lessonToEdit.id,
            title: lessonToEdit.title,
            description: lessonToEdit.description,
            notes: lessonToEdit.notes || "",
            videoUrl: lessonToEdit.videoUrl || "",
            orderIndex: lessonToEdit.orderIndex,
          });

          setEditingLessonId(lessonId);
          setShowLessonModal(true);
        }
      },
      [courseData.lessons]
    ),

    delete: useCallback(
      (lessonId: string) => {
        if (window.confirm("Are you sure you want to delete this lesson?")) {
          const updatedLessons = courseData.lessons.filter(
            (lesson) => lesson.id !== lessonId
          );

          // Reindex the remaining lessons
          const reindexedLessons = updatedLessons.map((lesson, index) => ({
            ...lesson,
            orderIndex: index,
          }));

          updateCourseField("lessons", reindexedLessons);
          showToast("Lesson deleted", "info");
        }
      },
      [courseData.lessons, showToast, updateCourseField]
    ),

    submit: useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate lesson data
        const errors = validateLesson(currentLesson);
        if (Object.keys(errors).length > 0) {
          setLessonErrors(errors);
          return;
        }

        try {
          // Place for video upload logic (to be implemented later)
          const videoUrl = currentLesson.videoUrl;

          if (editingLessonId) {
            // Update existing lesson
            const updatedLessons = courseData.lessons.map((lesson) =>
              lesson.id === editingLessonId
                ? {
                    ...currentLesson,
                    videoUrl: videoUrl || lesson.videoUrl,
                  }
                : lesson
            );

            updateCourseField("lessons", updatedLessons);
          } else {
            // Add new lesson with the next order index
            const nextOrderIndex = courseData.lessons.length;
            const newLesson: Lesson = {
              ...currentLesson,
              id: CourseUtils.generateId(),
              orderIndex: nextOrderIndex,
              videoUrl: videoUrl || "",
            };

            updateCourseField("lessons", [...courseData.lessons, newLesson]);
          }

          resetLessonForm();
          showToast(
            editingLessonId
              ? "Lesson updated successfully"
              : "Lesson added successfully",
            "success"
          );
        } catch (error) {
          console.error("Error saving lesson:", error);
          showToast("Failed to save lesson. Please try again.", "error");
        }
      },
      [
        courseData.lessons,
        currentLesson,
        editingLessonId,
        resetLessonForm,
        showToast,
        updateCourseField,
        validateLesson,
      ]
    ),
  };

  // Process API error responses
  const handleApiError = useCallback((error: any): string => {
    if (error.errors && Array.isArray(error.errors)) {
      return error.errors.map((err: any) => err.msg).join(", ");
    }
    return error.message || String(error);
  }, []);

  // Save course to backend
  const saveCourse = useCallback(async () => {
    try {
      setIsSaving(true);

      await courseUtils.updateCourseWithEntities(courseData, coverFile);

      showToast("Course updated successfully!", "success");
      router.push(`/teachers/${instructorId}/all`);
    } catch (err) {
      console.error("Error updating course:", err);
      const errorMessage = handleApiError(err);
      showToast(errorMessage, "error");
    } finally {
      setIsSaving(false);
    }
  }, [
    courseData,
    coverFile,
    handleApiError,
    instructorId,
    router,
    showToast,
    courseUtils,
  ]);

  return {
    courseData,
    isLoading,
    error,
    isSaving,
    coverFile,
    setCoverFile,
    coverPreview,
    setCoverPreview,
    showLessonModal,
    setShowLessonModal,
    currentLesson,
    editingLessonId,
    lessonErrors,

    // Methods
    updateCourseField,
    saveCourse,
    resetLessonForm,
    updateLessonOrder,

    // Grouped handlers
    outcomeHandlers: {
      add: outcomeHandlers.add,
      update: outcomeHandlers.update,
      remove: outcomeHandlers.remove,
    },

    lessonHandlers: {
      change: lessonHandlers.change,
      videoChange: lessonHandlers.videoChange,
      submit: lessonHandlers.submit,
      edit: lessonHandlers.edit,
      delete: lessonHandlers.delete,
    },
  };
}
