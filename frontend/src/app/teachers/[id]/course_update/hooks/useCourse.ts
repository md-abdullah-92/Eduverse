/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useToast } from "@/components/ui_elements/toast";
import { videoAPI } from "@/lib/api/videoAPI";
import { CourseUtils } from "@/utils/courseUtils";
import { CourseData, Lesson } from "@/utils/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

interface UseCourseProps {
  courseId: string;
  instructorId: string;
}

interface VideoState {
  selectedFile: File | null;
  error: string | null;
  isDragActive: boolean;
  isUploading: boolean;
  uploadProgress: number;
}

const INITIAL_COURSE_DATA: CourseData = {
  id: 0,
  title: "",
  price: "0.00",
  level: "",
  topic: "",
  description: "",
  coverPhotoUrl: null,
  instructorId: "",
  averageRating: 0.0,
  outcomes: [],
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

const INITIAL_VIDEO_STATE: VideoState = {
  selectedFile: null,
  error: null,
  isDragActive: false,
  isUploading: false,
  uploadProgress: 0,
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
  const [currentLesson, setCurrentLesson] =
    useState<Lesson>(INITIAL_LESSON_DATA);
  const [lessonErrors, setLessonErrors] = useState<Record<string, string>>({});

  // Consolidated video state
  const [videoState, setVideoState] = useState<VideoState>(INITIAL_VIDEO_STATE);

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

        const courseData = await courseUtils.fetchCourse();
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
      updateCourseField("outcomes", [...courseData.outcomes, { outcome: "" }]);
    }, [courseData.outcomes, updateCourseField]),

    update: useCallback(
      (index: number, value: string) => {
        const updatedOutcomes = [...courseData.outcomes];
        updatedOutcomes[index] = { outcome: value };
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

  // Video validation
  const validateVideoFile = useCallback((file: File): string | null => {
    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/avi",
      "video/mov",
    ];

    if (!allowedTypes.includes(file.type)) {
      return "Please select a valid video file (MP4, WebM, OGG, AVI, MOV)";
    }

    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return "File size should not exceed 500MB";
    }

    return null;
  }, []);

  // Video file selection (no upload yet)
  const handleVideoFileSelect = useCallback(
    (file: File) => {
      const validationError = validateVideoFile(file);

      setVideoState((prev) => ({
        ...prev,
        selectedFile: validationError ? null : file,
        error: validationError,
        isDragActive: false,
      }));
    },
    [validateVideoFile]
  );

  // Video drag and drop handlers
  const handleVideoDragEvents = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.type === "dragenter" || e.type === "dragover") {
        setVideoState((prev) => ({ ...prev, isDragActive: true }));
      } else if (e.type === "dragleave") {
        setVideoState((prev) => ({ ...prev, isDragActive: false }));
      }
    },
    []
  );

  const handleVideoDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleVideoFileSelect(file);
      }
    },
    [handleVideoFileSelect]
  );

  // Remove selected video file
  const handleVideoRemove = useCallback(() => {
    setVideoState(INITIAL_VIDEO_STATE);
    setCurrentLesson((prev) => ({ ...prev, videoUrl: "" }));
  }, []);

  // Upload video to server (called during lesson save)
  const uploadVideoFile = useCallback(
    async (file: File, lessonId: string): Promise<string> => {
      setVideoState((prev) => ({
        ...prev,
        isUploading: true,
        uploadProgress: 0,
        error: null,
      }));

      try {
        const formData = new FormData();
        formData.append("video", file);
        formData.append("courseId", courseId);
        formData.append("lessonId", lessonId);

        const result = await videoAPI.upload(formData, (progress: number) => {
          setVideoState((prev) => ({ ...prev, uploadProgress: progress }));
        });

        setVideoState((prev) => ({ ...prev, uploadProgress: 100 }));
        return result.data.url;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to upload video. Please try again.";
        setVideoState((prev) => ({ ...prev, error: errorMessage }));
        throw new Error(errorMessage);
      } finally {
        setVideoState((prev) => ({ ...prev, isUploading: false }));
      }
    },
    [courseId]
  );

  // Reset lesson form and video state
  const resetLessonForm = useCallback(() => {
    setCurrentLesson(INITIAL_LESSON_DATA);
    setEditingLessonId(null);
    setLessonErrors({});
    setVideoState(INITIAL_VIDEO_STATE);
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

  // Lesson form handlers
  const lessonHandlers = {
    change: useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentLesson((prev) => ({ ...prev, [name]: value }));

        if (lessonErrors[name]) {
          setLessonErrors((prev) => ({ ...prev, [name]: "" }));
        }
      },
      [lessonErrors]
    ),

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
          console.log("videoUrl:", lessonToEdit.videoUrl);
          setEditingLessonId(lessonId);
          setVideoState(INITIAL_VIDEO_STATE); // Reset video state for editing
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
          setIsSaving(true);
          let finalVideoUrl = currentLesson.videoUrl;

          // Upload video if a new file is selected
          if (videoState.selectedFile) {
            const lessonId = editingLessonId || CourseUtils.generateId();
            finalVideoUrl = await uploadVideoFile(
              videoState.selectedFile,
              lessonId
            );
          }

          if (editingLessonId) {
            // Update existing lesson
            const updatedLessons = courseData.lessons.map((lesson) =>
              lesson.id === editingLessonId
                ? { ...currentLesson, videoUrl: finalVideoUrl }
                : lesson
            );
            updateCourseField("lessons", updatedLessons);
            console.log("Updated lesson:", currentLesson);
          } else {
            // Add new lesson
            const nextOrderIndex = courseData.lessons.length;
            const newLesson: Lesson = {
              ...currentLesson,
              id: CourseUtils.generateId(),
              orderIndex: nextOrderIndex,
              videoUrl: finalVideoUrl,
            };
            console.log(newLesson);
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
        } finally {
          setIsSaving(false);
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
        videoState.selectedFile,
        uploadVideoFile,
      ]
    ),
  };

  // Handle lesson reordering
  const handleLessonReorder = useCallback(
    (reorderedLessons: Lesson[]) => {
      const updatedLessons = reorderedLessons.map((lesson, index) => ({
        ...lesson,
        orderIndex: index,
      }));
      updateCourseField("lessons", updatedLessons);
    },
    [updateCourseField]
  );

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
    // Course data
    courseData,
    isLoading,
    error,
    isSaving,

    // Cover image
    coverFile,
    setCoverFile,
    coverPreview,
    setCoverPreview,

    // Lesson modal
    showLessonModal,
    setShowLessonModal,
    currentLesson,
    editingLessonId,
    lessonErrors,

    // Video state (consolidated)
    videoState,

    // Methods
    updateCourseField,
    saveCourse,
    resetLessonForm,
    handleLessonReorder,

    // Video handlers (consolidated)
    handleVideoFileSelect,
    handleVideoDragEvents,
    handleVideoDrop,
    handleVideoRemove,

    // Grouped handlers
    outcomeHandlers: {
      add: outcomeHandlers.add,
      update: outcomeHandlers.update,
      remove: outcomeHandlers.remove,
    },

    lessonHandlers: {
      change: lessonHandlers.change,
      submit: lessonHandlers.submit,
      edit: lessonHandlers.edit,
      delete: lessonHandlers.delete,
    },
  };
}
