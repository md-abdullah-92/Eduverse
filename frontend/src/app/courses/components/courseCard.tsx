import { useAuth } from "@/app/auth/context";
import { useToast } from "@/components/ui_elements/toast";
import { EnrollmentUtils } from "@/utils/enrollmentUtils";
import { CourseData } from "@/utils/types";
import { StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CourseCardProps {
  course: CourseData;
  isEnrolled?: boolean; // Add this prop to indicate enrollment status
  progress?: number;
}

export default function CourseCard({
  course,
  isEnrolled = false,
  progress = 0,
}: CourseCardProps) {
  const { user } = useAuth();
  const isTeacher = user?.role === "TEACHER";
  const { showToast } = useToast();
  const router = useRouter();

  const enrollmentUtils = new EnrollmentUtils({
    userId: user!.id,
    onSuccess: (message) => {
      showToast(message, "success");
      router.push(`/students/${user!.id}/enrolled_course`);
    },
    onFailure: (message) => {
      showToast(message, "error");
    },
  });

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

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (isTeacher) {
      router.push(`/teachers/${user.id}/course_update/${course.id}`);
    } else if (isEnrolled) {
      // Navigate to the course learning page
      router.push(`/courses/${course.id}`);
    } else {
      // Add to cart or enroll logic
      enrollmentUtils.enrollInCourse(course.id);
      showToast("Course added to cart", "success");
      console.log("Adding course to cart:", course.id);
    }
  };

  const getButtonContent = () => {
    if (isTeacher) {
      console.log(course.instructorId, user.id);
      return {
        text:
          course.instructorId == user.id
            ? "Edit Course"
            : "Available for students",
        className:
          course.instructorId == user.id
            ? "w-full py-2 px-4 border border-blue-500 text-blue-500 font-semibold rounded-md hover:bg-blue-50 transition"
            : "w-full py-2 px-4 bg-gray-200 text-gray-500 font-medium rounded-md cursor-not-allowed",
        disabled: course.instructorId != user.id,
      };
    }

    if (isEnrolled) {
      return {
        text: progress > 0 ? "Continue Learning" : "Start Course",
        className:
          "w-full py-2 px-4 bg-purple-800 text-white font-medium rounded-md hover:bg-purple-700 transition-colors",
        disabled: false,
      };
    }

    if (course.price) {
      return {
        text: "Add to Cart",
        className:
          "w-full py-2 px-4 bg-teal-700 text-white font-medium rounded-md hover:bg-teal-600 transition-colors",
        disabled: false,
      };
    }

    return {
      text: "Enroll Free",
      className:
        "w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors",
      disabled: false,
    };
  };

  const buttonConfig = getButtonContent();

  return (
    <Link href={`/courses/${course.id}`} className="block">
      <div className="rounded-lg overflow-hidden bg-white transition-all duration-300 hover:shadow-xl border border-gray-200 h-full">
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
          {/* implement later */}
          <div className="text-sm text-gray-600 mb-1">{"Instructor Name"}</div>
          {/* implement later */}
          <div className="text-xs text-gray-500 mb-1">
            {"Instructor University"}
          </div>

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
            onClick={handleButtonClick}
            disabled={buttonConfig.disabled}
          >
            {buttonConfig.text}
          </button>
        </div>
      </div>
    </Link>
  );
}
