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
}

export default function CourseCard({ course }: CourseCardProps) {
  const { user } = useAuth();
  const isStudent = user?.role === "STUDENT";
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>No cover image</span>
              </div>
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white py-1 px-2 rounded-full text-xs font-medium text-teal-700 shadow-sm">
            {course.topic}
          </div>
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

          <div className="text-lg font-bold text-green-600 mt-3 mb-3">
            ৳{course.price ? course.price : "Free"}
          </div>

          {isStudent && course.price ? (
            <button
              className="w-full py-2 px-4 bg-teal-700 text-white font-medium rounded-md hover:bg-teal-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // implement add to cart logic here
                // I am not implementing it now
                // I am directly adding an enrollment
                enrollmentUtils.enrollInCourse(course.id);
                console.log("Adding course to cart:", course.id);
              }}
            >
              Add to Cart
            </button>
          ) : (
            <button
              className="w-full py-2 px-4 bg-gray-200 text-gray-500 font-medium rounded-md cursor-not-allowed"
              disabled
            >
              {course.price ? "Available for students" : "Free"}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
