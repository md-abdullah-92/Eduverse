import { Course } from "@/utils/types";
import { StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
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
        <span className="text-gray-600 text-sm ml-2">
          {/* {rating.toFixed(1)} ({course.reviews?.length || 0} reviews) */}
        </span>
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
          <div className="text-sm font-medium text-teal-700 mb-2">
            {course.level || "INTERMEDIATE"}
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

          {renderStars(course.averageRating)}

          <div className="text-lg font-bold text-green-600 mt-3 mb-3">
            ৳{course.price ? course.price.toFixed(2) : "Free"}
          </div>

          <button
            className="w-full py-2 px-4 bg-teal-700 text-white font-medium rounded-md cursor-not-allowed"
            onClick={(e) => {
              e.preventDefault(); // Prevent the link from navigating
              // You could add additional functionality here like adding to cart
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
}
