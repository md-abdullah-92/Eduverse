/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/courseUtils.ts
import { EnrollmentUtils } from "@/utils/enrollmentUtils";
import { CourseData } from "@/utils/types";
import { StarIcon } from "@heroicons/react/24/solid";

export interface ButtonConfig {
  text: string;
  className: string;
  disabled: boolean;
}

// UI utility functions
export const renderStars = (rating: number) => {
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

// Button configuration utility
export const getButtonConfig = (
  course: CourseData | null,
  isTeacher: boolean,
  isEnrolled: boolean,
  progress: number,
  userId?: string
): ButtonConfig => {
  const isLoggedIn = !!userId;

  if (!course) {
    return { text: "Loading...", className: "", disabled: true };
  }

  if (!isLoggedIn) {
    return {
      text: "Log in to enroll",
      className:
        "w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 rounded-lg transition-colors",
      disabled: false,
    };
  }

  if (isTeacher) {
    const isOwner = course.instructorId == userId;
    return {
      text: isOwner ? "Edit Course" : "Available for students",
      className: isOwner
        ? "w-full py-2 px-4 border border-blue-500 text-blue-500 font-semibold rounded-md hover:bg-blue-50 transition"
        : "w-full py-2 px-4 bg-gray-200 text-gray-500 font-medium rounded-md cursor-not-allowed",
      disabled: !isOwner,
    };
  }

  if (isEnrolled) {
    return {
      text: progress > 0 ? "Continue Learning" : "Start Course",
      className:
        "w-full py-2 px-4 bg-gray-300 text-black font-medium rounded-md hover:bg-gray-400 transition-colors",
      disabled: false,
    };
  }

  if (course.price && Number(course.price) > 0) {
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
      "w-full py-2 px-4 bg-purple-800 text-white font-medium rounded-md hover:bg-purple-700 transition-colors",
    disabled: false,
  };
};

export const getCourseUrl = (
  courseId: string,
  isEnrolled: boolean,
  enrollId?: number
) => {
  const baseUrl = `/courses/${courseId}`;
  return isEnrolled ? `${baseUrl}?enrolled=${enrollId}` : baseUrl;
};

// Course action handler
export const handleButtonAction = async ({
  course,
  user,
  isTeacher,
  isEnrolled,
  router,
  showToast,
  enrollId,
}: {
  course: CourseData | null;
  user: any;
  isTeacher: boolean;
  isEnrolled: boolean;
  router: any;
  showToast: (message: string, type: "success" | "error") => void;
  enrollId?: number;
}) => {
  const isLoggedIn = !!user;
  const enrollmentUtils = new EnrollmentUtils({
    userId: user.id,
    onSuccess: (message: string) => {
      showToast(message, "success");
      router.push(`/students/${user.id}/enrolled_course`);
    },
    onFailure: (message: string) => {
      showToast(message, "error");
    },
  });

  if (!course) return;

  if (!isLoggedIn) {
    router.push("/auth/login");
    return;
  }

  if (isTeacher) {
    router.push(`/teachers/${user.id}/course_update/${course.id}`);
  } else if (isEnrolled) {
    // Navigate to the course learning page
    router.push(getCourseUrl(course.id.toString(), isEnrolled, enrollId));
  } else {
    // Handle enrollment or cart logic
    if (course.price && Number(course.price) > 0) {
      // Paid course - add to cart
      showToast("Course added to cart", "success");
      // Add cart logic here
    } else {
      // Free course - direct enrollment
      enrollmentUtils.enrollInCourse(course.id);
      showToast("Successfully Enrolled in Free course", "success");
    }
  }
};
