"use client";
import CourseForm from "@/app/teachers/[id]/course_update/components/CourseForm";
import LessonForm from "@/app/teachers/[id]/course_update/components/LessonForm";
import LessonList from "@/app/teachers/[id]/course_update/components/LessonList";
import { useCourse } from "@/app/teachers/[id]/course_update/hooks/useCourse";
import { Lesson } from "@/utils/types";
import { Plus, Video, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback } from "react";

export default function CourseDashboard() {
  const params = useParams();
  const instructorId = params.id as string;
  const courseId = params.id2 as string;

  const {
    courseData,
    isLoading,
    error,
    isSaving,
    coverPreview,
    setCoverFile,
    showLessonModal,
    setShowLessonModal,
    editingLessonId,
    setCoverPreview,
    currentLesson,
    lessonErrors,

    // Video state (consolidated)
    videoState,

    // Methods
    updateCourseField,
    saveCourse,
    resetLessonForm,

    // Video handlers (consolidated)
    handleVideoFileSelect,
    handleVideoDragEvents,
    handleVideoDrop,
    handleVideoRemove,

    // Grouped handlers
    outcomeHandlers,
    lessonHandlers,
  } = useCourse({ courseId, instructorId });

  // Handle cover image change - will be passed to CourseForm
  const handleCoverChange = useCallback(
    (file: File | null) => {
      setCoverFile(file);
      setCoverPreview(file ? URL.createObjectURL(file) : null);
    },
    [setCoverFile, setCoverPreview]
  );

  // Handle modal closing with cleanup
  const handleCloseModal = useCallback(() => {
    setShowLessonModal(false);
    resetLessonForm();
  }, [setShowLessonModal, resetLessonForm]);

  // Handle lesson reordering
  const handleLessonReorder = useCallback(
    (reorderedLessons: Lesson[]) => {
      // Update the orderIndex values based on new order
      const updatedLessons = reorderedLessons.map((lesson, index) => ({
        ...lesson,
        orderIndex: index,
      }));

      // Update the course data with reordered lessons
      updateCourseField("lessons", updatedLessons);
    },
    [updateCourseField]
  );

  if (isLoading) {
    return <div className="p-8 text-center">Loading course details...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 bg-white text-gray-900 min-h-screen relative">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-teal-800">Course Dashboard</h1>
        <button
          onClick={saveCourse}
          disabled={isSaving}
          className={`${
            isSaving ? "bg-gray-400" : "bg-teal-700 hover:bg-teal-800"
          } text-white font-semibold py-2 px-6 rounded-md flex items-center transition-colors`}
        >
          {isSaving ? "Saving..." : "Save Course"}
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
              {/* Course Form */}
              <CourseForm
                courseData={courseData}
                onUpdate={updateCourseField}
                onAddOutcome={outcomeHandlers.add}
                onRemoveOutcome={outcomeHandlers.remove}
                onUpdateOutcome={outcomeHandlers.update}
                onCoverChange={handleCoverChange}
                coverPreview={coverPreview}
              />
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
                <LessonList
                  lessons={courseData.lessons}
                  onEdit={lessonHandlers.edit}
                  onDelete={lessonHandlers.delete}
                  onReorder={handleLessonReorder}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl relative shadow-xl">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-teal-700 mb-6">
              {editingLessonId ? "Edit Lesson" : "Add Lesson"}
            </h2>

            <LessonForm
              initialData={currentLesson}
              editingId={editingLessonId}
              courseId={courseId}
              onChange={lessonHandlers.change}
              onSubmit={lessonHandlers.submit}
              onCancel={handleCloseModal}
              errors={lessonErrors}
              // Video handling props from hook
              videoState={videoState}
              onVideoFileSelect={handleVideoFileSelect}
              onVideoDragEvents={handleVideoDragEvents}
              onVideoDrop={handleVideoDrop}
              onVideoRemove={handleVideoRemove}
            />
          </div>
        </div>
      )}
    </div>
  );
}
