import { CourseData } from "@/utils/types";
import { StarIcon } from "lucide-react";
import Image from "next/image";

// Student course card component
export default function StudentCourseCard({
  course,
  progress,
}: {
  course: CourseData;
  progress: number;
  studentId: string;
}) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg border border-gray-100">
      {/* Course Image */}
      <div className="h-48 bg-gray-200 relative">
        {course.coverPhotoUrl ? (
          <div className="w-full h-full relative">
            <Image
              src={course.coverPhotoUrl}
              alt={course.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-white py-1 px-2 rounded-full text-xs font-medium text-teal-700 shadow-sm">
            {course.topic}
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white py-1 px-2 rounded-full text-xs font-medium text-teal-700 shadow-sm">
          {course.topic}
        </div>
      </div>

      {/* Course Info */}
      <div className="p-5">
        <div className="text-sm font-medium text-teal-700 mb-2 flex items-center justify-between">
          {course.level || "INTERMEDIATE"}
          {renderStars(course.averageRating)}
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {course.title}
        </h3>
        {/* implement later */}
        <div className="text-sm text-gray-600 mb-1">{"Instructor Name"}</div>
        {/* implement later */}
        <div className="text-xs text-gray-500 mb-1">
          {"Instructor University"}
        </div>

        {/* Progress Bar */}
        <div className="mt-3 mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-gray-700">Your Progress</span>
            <span className="text-teal-600 font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex mt-4 gap-2">
          <a
            href={`/courses/${course.id}/learn`}
            className="flex-1 text-center py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors text-sm font-medium"
          >
            {progress > 0 ? "Continue Learning" : "Start Course"}
          </a>

          <a
            href={`/courses/${course.id}/details`}
            className="py-2 px-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Details
          </a>
        </div>
      </div>
    </div>
  );
}
