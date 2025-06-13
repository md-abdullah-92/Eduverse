import { useAuth } from "@/app/auth/context";
import { useToast } from "@/components/ui_elements/toast";
import { CourseData } from "@/utils/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getButtonConfig,
  handleButtonAction,
  renderStars,
} from "../utils/couseCardUtils";

interface CourseCardProps {
  course: CourseData;
  isEnrolled?: boolean;
  progress?: string;
  enrollmentId?: number;
}

export default function CourseCard({
  course,
  isEnrolled = false,
  progress = "0",
  enrollmentId,
}: CourseCardProps) {
  const { user } = useAuth();
  const isTeacher = user?.role === "TEACHER";
  const { showToast } = useToast();
  const router = useRouter();

  const buttonConfig = getButtonConfig(
    course,
    isTeacher,
    isEnrolled,
    Number(progress),
    user?.id || ""
  );

  return (
    <Link
      href={
        isEnrolled
          ? `/courses/${course.id}?enrolled=${Number(enrollmentId)}`
          : `/courses/${course.id}`
      }
      className="block"
    >
      <div className="rounded-lg overflow-hidden bg-white transition-all duration-300 hover:shadow-2xl border-1 border-teal-300 h-full">
        {/* Cover Image */}
        <div className="w-full h-48 relative">
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
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
              <div className="flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                  />
                </svg>
                <span>No cover image</span>
              </div>
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white py-1 px-2 rounded-full text-xs font-medium text-teal-700 shadow-sm">
            {course.topic}
          </div>

          {/* Enrollment Status Badge */}
          {isEnrolled && (
            <div className="absolute top-3 left-3 bg-purple-800 text-white py-1 px-2 rounded-full text-xs font-medium shadow-sm">
              Enrolled
            </div>
          )}
        </div>

        {/* Course Info */}
        <div className="p-4">
          <div className="text-sm font-medium text-teal-700 mb-2 flex items-center justify-between">
            {course.level || "INTERMEDIATE"}
            {renderStars(course.averageRating)}
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {course.title}
          </h3>
          <div className="text-sm text-gray-600 mb-1">{course.description}</div>

          {isEnrolled ? (
            // progress bar
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
          ) : (
            // price
            <div className="text-lg font text-gray-600 mt-3 mb-3">
              ৳ {course.price ? course.price : "Free"}
            </div>
          )}

          <button
            className={buttonConfig.className}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleButtonAction({
                course,
                user,
                isTeacher,
                isEnrolled,
                router,
                showToast,
                enrollmentId,
              });
            }}
            disabled={buttonConfig.disabled}
          >
            {buttonConfig.text}
          </button>
        </div>
      </div>
    </Link>
  );
}
