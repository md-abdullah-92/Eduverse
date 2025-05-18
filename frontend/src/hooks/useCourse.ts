"use client";
import { useToast } from "@/components/ui/toast";
import { storage } from "@/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Define proper interfaces for better type safety
import { CourseData, LessonForm } from "@/utils/types";

interface UseCourseProps {
  courseId: string;
  instructorId: string;
}

const INITIAL_COURSE_DATA: CourseData = {
  title: "",
  price: "",
  description: "",
  level: "",
  outcomes: [""],
  lessons: [],
};

const INITIAL_LESSON_FORM: LessonForm = {
  title: "",
  description: "",
  lectureNote: "",
  video: null,
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
  const [lessonForm, setLessonForm] = useState<LessonForm>(INITIAL_LESSON_FORM);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001";

  // Generate unique ID for lessons
  const generateId = useCallback(
    (): string =>
      `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    []
  );

  // Format lessons to ensure they have proper structure
  const formatLessons = useCallback(
    (lessons: any[]): Lesson[] => {
      if (!Array.isArray(lessons)) return [];

      return lessons.map((lesson) => ({
        id: lesson.id || generateId(),
        title: lesson.title || "",
        description: lesson.description || "",
        lectureNote: lesson.notes || "",
        videoUrl: lesson.videoUrl || null,
      }));
    },
    [generateId]
  );

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/api/courses/get/${courseId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch course details.");
        }

        const data = await response.json();

        setCourseData({
          title: data.title || "",
          price:
            typeof data.price === "number" ? data.price.toFixed(2) : "0.00",
          level: data.level || "",
          description: data.description || "",
          coverPhotoUrl: data.coverPhotoUrl,
          outcomes: Array.isArray(data.outcomes)
            ? data.outcomes.map(
                (outcome: { outcome: string }) => outcome.outcome
              )
            : [""],
          lessons: formatLessons(data.lessons || []),
        });
        setCoverPreview(data.coverPhotoUrl);
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
  }, [courseId, showToast, API_BASE_URL, formatLessons]);

  // Update course field handlers
  const updateCourseField = useCallback(
    <K extends keyof CourseData>(field: K, value: CourseData[K]) => {
      setCourseData((prev) => ({ ...prev, [field]: value }));
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

  // Handle uploads to Firebase storage
  const uploadToStorage = useCallback(
    async (file: File, path: string): Promise<string> => {
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    },
    []
  );

  // Upload cover image to storage
  const uploadCoverImage = useCallback(async (): Promise<string> => {
    if (!coverFile) {
      return courseData.coverPhotoUrl || "";
    }

    try {
      const url = await uploadToStorage(
        coverFile,
        `course_covers/${Date.now()}-${coverFile.name}`
      );
      updateCourseField("coverPhotoUrl", url);
      return url;
    } catch (error) {
      console.error("Error uploading cover image:", error);
      showToast("Failed to upload cover image", "error");
      throw new Error("Failed to upload cover image");
    }
  }, [
    coverFile,
    courseData.coverPhotoUrl,
    showToast,
    updateCourseField,
    uploadToStorage,
  ]);

  // Reset lesson form
  const resetLessonForm = useCallback(() => {
    setLessonForm(INITIAL_LESSON_FORM);
    setEditingLessonId(null);
    setShowLessonModal(false);
  }, []);

  // Lesson form handlers
  const lessonHandlers = {
    change: useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLessonForm((prev) => ({ ...prev, [name]: value }));
      },
      []
    ),

    videoChange: useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setLessonForm((prev) => ({ ...prev, video: file }));
    }, []),

    edit: useCallback(
      (lessonId: string) => {
        const lessonToEdit = courseData.lessons.find(
          (lesson) => lesson.id === lessonId
        );
        if (lessonToEdit) {
          setLessonForm({
            title: lessonToEdit.title,
            description: lessonToEdit.description,
            lectureNote: lessonToEdit.lectureNote,
            video: null,
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
          updateCourseField("lessons", updatedLessons);
          showToast("Lesson deleted", "info");
        }
      },
      [courseData.lessons, showToast, updateCourseField]
    ),

    submit: useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        try {
          let videoUrl: string | null = null;

          // Upload video if provided
          if (lessonForm.video) {
            videoUrl = await uploadToStorage(
              lessonForm.video,
              `course_videos/${courseId}/${Date.now()}-${lessonForm.video.name}`
            );
          }

          const updatedLessons = editingLessonId
            ? courseData.lessons.map((lesson) =>
                lesson.id === editingLessonId
                  ? {
                      ...lesson,
                      title: lessonForm.title,
                      description: lessonForm.description,
                      lectureNote: lessonForm.lectureNote,
                      videoUrl: videoUrl || lesson.videoUrl,
                    }
                  : lesson
              )
            : [
                ...courseData.lessons,
                {
                  id: generateId(),
                  title: lessonForm.title,
                  description: lessonForm.description,
                  lectureNote: lessonForm.lectureNote,
                  videoUrl,
                },
              ];

          updateCourseField("lessons", updatedLessons);
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
        courseId,
        editingLessonId,
        generateId,
        lessonForm,
        resetLessonForm,
        showToast,
        updateCourseField,
        uploadToStorage,
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

      // Validate price
      const parsedPrice = parseFloat(
        String(courseData.price).replace(",", ".")
      );
      if (isNaN(parsedPrice)) {
        showToast("Please enter a valid price", "error");
        return;
      }

      // Upload cover image if changed
      const coverPhotoUrl = coverFile
        ? await uploadCoverImage()
        : courseData.coverPhotoUrl;

      // Create data for API submission
      const apiCourseData = {
        ...courseData,
        price: parsedPrice,
        coverPhotoUrl,
      };

      // Update the course
      const response = await fetch(
        `${API_BASE_URL}/api/courses/update/${courseId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiCourseData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      // Handle lessons: First fetch existing
      const existingLessonsResponse = await fetch(
        `${API_BASE_URL}/api/lessons/get/${courseId}`
      );
      if (!existingLessonsResponse.ok) {
        throw new Error("Failed to fetch existing lessons");
      }

      const existingLessons = await existingLessonsResponse.json();

      // Delete all existing lessons first (batch approach)
      await Promise.all(
        existingLessons.map((lesson: any) =>
          fetch(`${API_BASE_URL}/api/lessons/delete/${lesson.id}`, {
            method: "DELETE",
          })
        )
      );

      // Create new lessons from courseData.lessons
      await Promise.all(
        courseData.lessons.map((lesson) =>
          fetch(`${API_BASE_URL}/api/lessons/add/${courseId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: lesson.title,
              description: lesson.description,
              lectureNote: lesson.lectureNote,
              videoUrl: lesson.videoUrl,
            }),
          })
        )
      );

      // Handle outcomes: First fetch existing
      const existingOutcomesResponse = await fetch(
        `${API_BASE_URL}/api/outcomes/get/${courseId}`
      );
      if (!existingOutcomesResponse.ok) {
        throw new Error("Failed to fetch existing outcomes");
      }

      const existingOutcomes = await existingOutcomesResponse.json();
      const existingOutcomeTexts = existingOutcomes.map(
        (outcome: { outcome: string }) => outcome.outcome
      );

      // Delete outcomes that are no longer needed
      const outcomesToDelete = existingOutcomes.filter(
        (outcome: { outcome: string; id: string }) =>
          !courseData.outcomes.includes(outcome.outcome)
      );

      await Promise.all(
        outcomesToDelete.map((outcome: { id: string }) =>
          fetch(`${API_BASE_URL}/api/outcomes/delete/${outcome.id}`, {
            method: "DELETE",
          })
        )
      );

      // Add new outcomes
      const newOutcomes = courseData.outcomes.filter(
        (outcome: string) =>
          !existingOutcomeTexts.includes(outcome) && outcome.trim() !== ""
      );

      await Promise.all(
        newOutcomes.map((outcome) =>
          fetch(`${API_BASE_URL}/api/outcomes/add/${courseId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ outcome }),
          })
        )
      );

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
    API_BASE_URL,
    courseData,
    courseId,
    coverFile,
    handleApiError,
    instructorId,
    router,
    showToast,
    uploadCoverImage,
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
    lessonForm,
    editingLessonId,

    // Methods
    updateCourseField,
    uploadCoverImage,
    saveCourse,
    resetLessonForm,

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
