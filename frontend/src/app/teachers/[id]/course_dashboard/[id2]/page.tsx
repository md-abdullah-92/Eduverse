"use client";

import { storage } from "@/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  CheckCircle,
  Edit2,
  ImageIcon,
  ListChecks,
  Plus,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";

// Type definitions
interface Lesson {
  id: string;
  title: string;
  description: string;
  lectureNote: string;
  videoUrl: string | null;
}

interface LessonFormData {
  title: string;
  description: string;
  lectureNote: string;
  video: File | null;
}

interface CourseData {
  title: string;
  price: number | string;
  description: string;
  coverPhotoUrl?: string;
  level: string;
  outcomes: string[];
  lessons: Lesson[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function CourseDashboard() {
  const params = useParams();
  const instructorId = params.id as string;
  const courseId = params.id2 as string;
  const router = useRouter();

  // Course state
  const [courseData, setCourseData] = useState<CourseData>({
    title: "",
    price: "",
    level: "",
    description: "",
    outcomes: [""],
    lessons: [],
  });

  // UI state
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Lesson form state
  const [lessonForm, setLessonForm] = useState<LessonFormData>({
    title: "",
    description: "",
    lectureNote: "",
    video: null,
  });

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
          outcomes:
            Array.isArray(data.outcomes) && data.outcomes.length > 0
              ? data.outcomes
              : [""],
          lessons: formatLessons(data.lessons || []),
        });

        setCoverPreview(data.coverPhotoUrl || null);
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // Format lessons to ensure they have proper structure
  const formatLessons = (lessons: any[]): Lesson[] => {
    if (!Array.isArray(lessons)) return [];

    return lessons.map((lesson) => {
      // Convert string lessons to objects if needed
      if (typeof lesson === "string") {
        return {
          id: generateId(),
          title: lesson,
          description: "",
          lectureNote: "",
          videoUrl: null,
        };
      }

      // Make sure all lessons have IDs
      return {
        id: lesson.id || generateId(),
        title: lesson.title || "",
        description: lesson.description || "",
        lectureNote: lesson.lectureNote || "",
        videoUrl: lesson.videoUrl || null,
      };
    });
  };

  const generateId = (): string => {
    return `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  };

  // Update course field handlers
  const updateCourseField = <K extends keyof CourseData>(
    field: K,
    value: CourseData[K]
  ) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle cover image change
  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Upload cover image to storage
  const uploadCoverImage = async (): Promise<string> => {
    if (!coverFile) {
      return coverPreview || "";
    }

    const storageRef = ref(
      storage,
      `course_covers/${Date.now()}-${coverFile.name}`
    );

    try {
      await uploadBytes(storageRef, coverFile);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error uploading cover image:", error);
      throw new Error("Failed to upload cover image.");
    }
  };

  // Learning outcomes handlers
  const addOutcome = () => {
    updateCourseField("outcomes", [...courseData.outcomes, ""]);
  };

  const updateOutcome = (index: number, value: string) => {
    const updatedOutcomes = [...courseData.outcomes];
    updatedOutcomes[index] = value;
    updateCourseField("outcomes", updatedOutcomes);
  };

  const removeOutcome = (index: number) => {
    const updatedOutcomes = courseData.outcomes.filter((_, i) => i !== index);
    updateCourseField("outcomes", updatedOutcomes);
  };

  // Lesson form handlers
  const handleLessonChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLessonForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setLessonForm((prev) => ({ ...prev, video: file }));
  };

  // Upload lesson video
  const uploadLessonVideo = async (file: File): Promise<string> => {
    const videoStorageRef = ref(
      storage,
      `course_videos/${courseId}/${Date.now()}-${file.name}`
    );

    await uploadBytes(videoStorageRef, file);
    return await getDownloadURL(videoStorageRef);
  };

  // Handle lesson form submission
  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let videoUrl: string | null = null;

      // Upload video if provided
      if (lessonForm.video) {
        videoUrl = await uploadLessonVideo(lessonForm.video);
      }

      let updatedLessons: Lesson[];

      if (editingLessonId) {
        // Editing an existing lesson
        updatedLessons = courseData.lessons.map((lesson) => {
          if (lesson.id === editingLessonId) {
            return {
              ...lesson,
              title: lessonForm.title,
              description: lessonForm.description,
              lectureNote: lessonForm.lectureNote,
              // Only update videoUrl if a new video was uploaded
              videoUrl: videoUrl || lesson.videoUrl,
            };
          }
          return lesson;
        });
      } else {
        // Creating a new lesson
        const newLesson: Lesson = {
          id: generateId(),
          title: lessonForm.title,
          description: lessonForm.description,
          lectureNote: lessonForm.lectureNote,
          videoUrl,
        };

        updatedLessons = [...courseData.lessons, newLesson];
      }

      // Update lessons in course data
      updateCourseField("lessons", updatedLessons);

      // Reset form and state
      resetLessonForm();
    } catch (error) {
      console.error("Error saving lesson:", error);
      alert("Failed to save lesson. Please try again.");
    }
  };

  // Reset lesson form
  const resetLessonForm = useCallback(() => {
    setLessonForm({
      title: "",
      description: "",
      lectureNote: "",
      video: null,
    });
    setEditingLessonId(null);
    setShowLessonModal(false);
  }, []);

  // Edit lesson
  const handleEditLesson = (lessonId: string) => {
    const lessonToEdit = courseData.lessons.find(
      (lesson) => lesson.id === lessonId
    );

    if (lessonToEdit) {
      setLessonForm({
        title: lessonToEdit.title,
        description: lessonToEdit.description,
        lectureNote: lessonToEdit.lectureNote,
        video: null, // Can't restore file input, but we keep the URL
      });

      setEditingLessonId(lessonId);
      setShowLessonModal(true);
    }
  };

  // Delete lesson
  const handleDeleteLesson = (lessonId: string) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      const updatedLessons = courseData.lessons.filter(
        (lesson) => lesson.id !== lessonId
      );
      updateCourseField("lessons", updatedLessons);
    }
  };

  // Save course
  const handleSaveCourse = async () => {
    try {
      const parsedPrice = parseFloat(
        String(courseData.price).replace(",", ".")
      );

      if (isNaN(parsedPrice)) {
        alert("Please enter a valid price.");
        return;
      }

      const coverPhotoUrl = await uploadCoverImage();

      const response = await fetch(
        `${API_BASE_URL}/api/courses/update/${courseId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...courseData,
            price: parsedPrice,
            coverPhotoUrl,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update course");
      }

      alert("Course updated successfully!");
      router.push(`/teachers/${instructorId}/all`);
    } catch (err) {
      console.error("Error updating course:", err);
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  if (isLoading)
    return <div className="p-8 text-center">Loading course details...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 bg-white text-gray-900 min-h-screen relative">
      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl relative shadow-xl">
            <button
              onClick={resetLessonForm}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-teal-700 mb-6">
              {editingLessonId ? "Edit Lesson" : "Add Lesson"}
            </h2>

            <form onSubmit={handleLessonSubmit}>
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Lecture Video
                </label>
                {editingLessonId &&
                  courseData.lessons.find((l) => l.id === editingLessonId)
                    ?.videoUrl && (
                    <div className="mb-2 flex items-center text-sm text-gray-600">
                      <Video size={16} className="mr-1" />
                      <span>Current video is attached</span>
                    </div>
                  )}

                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-teal-50 file:text-teal-700
                  hover:file:bg-teal-100"
                />
              </div>

              <div className="border-t border-b border-gray-200 py-6 mb-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={lessonForm.title}
                    onChange={handleLessonChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Description
                  </label>
                  <textarea
                    name="description"
                    value={lessonForm.description}
                    onChange={handleLessonChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lecture Notes
                </label>
                <textarea
                  name="lectureNote"
                  value={lessonForm.lectureNote}
                  onChange={handleLessonChange}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={resetLessonForm}
                  className="mr-3 px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2 rounded-md transition-all"
                >
                  {editingLessonId ? "Update Lesson" : "Add Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-teal-800">Course Dashboard</h1>
        <button
          onClick={handleSaveCourse}
          className="bg-teal-700 hover:bg-teal-800 text-white font-semibold py-2 px-6 rounded-md flex items-center"
        >
          <span>Save Course</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Course Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                Course Information
              </h2>
            </div>

            <div className="p-5">
              {/* Cover Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image
                </label>
                <div className="mt-1 flex flex-col items-center">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover Preview"
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 mb-3">
                      <ImageIcon size={36} className="mb-2" />
                      <p className="text-sm">No cover image selected</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    id="cover-upload"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("cover-upload")?.click()
                    }
                    className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-md flex items-center"
                  >
                    <Upload size={16} className="mr-2" />
                    {coverPreview ? "Change Cover Image" : "Upload Cover Image"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={courseData.title}
                    onChange={(e) => updateCourseField("title", e.target.value)}
                    placeholder="Enter course title"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Price
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="text"
                      value={courseData.price}
                      onChange={(e) =>
                        updateCourseField("price", e.target.value)
                      }
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded-md pl-7 p-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Description
                </label>
                <textarea
                  value={courseData.description}
                  onChange={(e) =>
                    updateCourseField("description", e.target.value)
                  }
                  placeholder="Write course description..."
                  className="w-full border border-gray-300 rounded-md p-2 min-h-[120px] resize-y focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Learning Outcomes Section */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Learning Outcomes
              </h2>
              <button
                onClick={addOutcome}
                className="flex items-center text-sm text-teal-700 hover:text-teal-900"
              >
                <Plus size={16} className="mr-1" /> Add Outcome
              </button>
            </div>

            <div className="p-5">
              {courseData.outcomes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ListChecks size={24} className="mx-auto mb-2" />
                  <p>Add what students will learn from this course</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {courseData.outcomes.map((outcome, index) => (
                    <div key={index} className="flex items-center">
                      <div className="flex-shrink-0 mr-2 text-teal-600">
                        <CheckCircle size={18} />
                      </div>
                      <input
                        type="text"
                        value={outcome}
                        onChange={(e) => updateOutcome(index, e.target.value)}
                        placeholder={`Learning outcome ${index + 1}`}
                        className="flex-1 border border-gray-300 rounded-md p-2 bg-gray-50 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <button
                        onClick={() => removeOutcome(index)}
                        className="ml-2 text-gray-400 hover:text-red-500"
                        aria-label="Remove outcome"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Course Lessons */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
            <div className="p-5 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Course Content
              </h2>
              <button
                onClick={() => setShowLessonModal(true)}
                className="flex items-center text-sm bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded"
              >
                <Plus size={16} className="mr-1" /> Add Lesson
              </button>
            </div>

            <div className="p-5">
              {courseData.lessons.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Video size={32} className="mx-auto mb-2" />
                  <p className="mb-2">No lessons added yet</p>
                  <button
                    onClick={() => setShowLessonModal(true)}
                    className="text-teal-700 hover:underline font-medium"
                  >
                    Add your first lesson
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {courseData.lessons.map(
                    (lesson, index) =>
                      lesson.title && (
                        <div
                          key={lesson.id}
                          className="p-3 bg-gray-50 rounded-md border border-gray-200 flex items-center"
                        >
                          <div className="mr-3 h-8 w-8 flex items-center justify-center bg-teal-100 text-teal-700 rounded-full">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{lesson.title}</div>
                            {lesson.description && (
                              <div className="text-sm text-gray-500 truncate">
                                {lesson.description}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditLesson(lesson.id)}
                              className="text-gray-400 hover:text-teal-600"
                              aria-label="Edit lesson"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="text-gray-400 hover:text-red-500"
                              aria-label="Delete lesson"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
