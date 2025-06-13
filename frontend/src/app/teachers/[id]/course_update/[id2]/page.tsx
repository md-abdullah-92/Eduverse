"use client";
import CourseForm from "@/app/teachers/[id]/course_update/components/CourseForm";
import LessonForm from "@/app/teachers/[id]/course_update/components/LessonForm";
import LessonList from "@/app/teachers/[id]/course_update/components/LessonList";
import { useCourse } from "@/app/teachers/[id]/course_update/hooks/useCourse";
import Sidebar from "@/app/teachers/components/Sidebar";
import { ErrorDisplay } from "@/components/ui_elements/ErrorDisplay";
import LoadingIndicator from "@/components/ui_elements/loadingIndicator";
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
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg">
          <Sidebar role="TEACHER" userId={instructorId} />
        </div>
        <div className="ml-64 flex items-center justify-center min-h-screen">
          <LoadingIndicator text="Loading course details..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg">
          <Sidebar role="TEACHER" userId={instructorId} />
        </div>
        <div className="ml-64 flex items-center justify-center min-h-screen p-4">
          <ErrorDisplay
            title="Error loading course details"
            description={error}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg">
        <Sidebar role="TEACHER" userId={instructorId} />
      </div>

      {/* Main Content Area */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 pl-20 sm:pl-[80px] lg:pl-[80px] pr-4 sm:pr-6 lg:pr-8 py-6 sticky top-0 z-40 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-14">
            <h1 className="text-2xl sm:text-3xl font-bold text-teal-800">
              Course Dashboard
            </h1>
            <button
              onClick={saveCourse}
              disabled={isSaving}
              className={`${
                isSaving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-teal-700 hover:bg-teal-800 active:bg-teal-900"
              } text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 shadow-sm`}
            >
              {isSaving ? "Saving..." : "Save Course"}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              {/* Course Details Section */}
              <div className="xl:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 sticky top-0 z-20 rounded-t-xl">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Course Information
                    </h2>
                  </div>

                  <div className="p-6">
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

              {/* Course Lessons Section */}
              <div className="xl:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit min-h-[500px]">
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 sticky top-0 z-20 rounded-t-xl">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Course Content
                      </h2>
                      <button
                        onClick={() => setShowLessonModal(true)}
                        className="flex items-center text-sm bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white px-3 py-2 rounded-lg transition-colors duration-200 shadow-sm"
                      >
                        <Plus size={16} className="mr-1" />
                        <span className="hidden sm:inline">Add Lesson</span>
                        <span className="sm:hidden">Add</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {courseData.lessons.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <div className="mb-4">
                          <Video size={48} className="mx-auto text-gray-300" />
                        </div>
                        <p className="text-lg font-medium mb-2">
                          No lessons yet
                        </p>
                        <p className="text-sm mb-4">
                          Start building your course content
                        </p>
                        <button
                          onClick={() => setShowLessonModal(true)}
                          className="inline-flex items-center text-teal-700 hover:text-teal-800 font-medium text-sm bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                          <Plus size={16} className="mr-1" />
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
          </div>
        </main>
      </div>

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-teal-700">
                {editingLessonId ? "Edit Lesson" : "Add Lesson"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-lg hover:bg-gray-100"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
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
        </div>
      )}
    </div>
  );
}
