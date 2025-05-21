"use client";

import { CourseData } from "@/utils/types";
import { PhotoIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { use, useEffect, useState } from "react";
import { FiAward, FiBook, FiClock, FiStar } from "react-icons/fi";

interface CourseDetailsProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetails({ params }: CourseDetailsProps) {
  const resolvedParams = use(params);
  const [course, setCourse] = useState<CourseData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log("Fetching course:", resolvedParams.id);
        const url = `http://localhost:5001/api/courses/get/${resolvedParams.id}`;
        console.log("Fetch URL:", url);

        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Response not OK:", response.status, errorText);
          throw new Error(
            `Failed to fetch course details: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();
        console.log("Course data:", data);
        setCourse(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error || "Course not found"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Full-width image background */}
        <div className="absolute inset-0">
          {course.coverPhotoUrl ? (
            <Image
              src={course.coverPhotoUrl}
              alt={course.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gradient-to-r from-gray-200 to-gray-300">
              <PhotoIcon className="h-16 w-16 text-gray-400" />
              <p className="mt-2 text-lg font-medium text-gray-500">
                No cover photo available
              </p>
            </div>
          )}
        </div>
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60"></div>
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <div className="max-w-3xl backdrop-blur-sm bg-black/30 p-8 rounded-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              {course.title}
            </h1>
            <p className="text-gray-100 text-lg mb-8">{course.description}</p>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <FiClock className="text-white" />
                <span className="text-white">
                  {course.lessons.length} Lessons
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <FiBook className="text-white" />
                <span className="text-white capitalize">
                  {course.level.toLowerCase()}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <FiStar className="text-white" />
                <span className="text-white">
                  {course.averageRating?.toFixed(1) || "No ratings"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Outcomes */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-12 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FiAward className="mr-3 text-teal-600" />
                What you&apos;ll learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {course.outcomes.map((outcome, index) => (
                  <div
                    key={`${outcome}-${index}`}
                    className="flex items-start space-x-3 p-4 rounded-lg bg-teal-50/50 border border-teal-100"
                  >
                    <svg
                      className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{outcome.outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FiBook className="mr-3 text-teal-600" />
                Course Curriculum
              </h2>
              <div className="space-y-4">
                {course.lessons
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="border border-gray-100 rounded-lg p-4 hover:border-teal-500 transition-all duration-200 hover:shadow-md group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-teal-600 font-medium">
                              Lesson {index + 1}
                            </span>
                            <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                              {lesson.title}
                            </h3>
                          </div>
                          {lesson.description && (
                            <p className="text-gray-500 text-sm mt-2 ml-16">
                              {lesson.description}
                            </p>
                          )}
                        </div>
                        {lesson.videoUrl && (
                          <div className="flex items-center space-x-2 text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                            <FiBook className="text-sm" />
                            <span className="text-sm font-medium">Video</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Course Meta */}
          <div>
            <div className="bg-white p-8 rounded-xl shadow-sm sticky top-4 border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <div className="text-3xl font-bold text-gray-900">
                  ${course.price}
                </div>
                <div className="px-4 py-2 bg-teal-100 text-teal-800 rounded-full text-sm font-medium">
                  {course.level}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-teal-50 rounded-lg">
                    <FiClock className="text-teal-600 text-xl" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Course Length
                    </div>
                    <div className="text-sm text-gray-500">
                      {course.lessons.length} lessons
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-teal-50 rounded-lg">
                    <FiStar className="text-teal-600 text-xl" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Course Rating
                    </div>
                    <div className="text-sm text-gray-500">
                      {course.averageRating} average rating
                    </div>
                  </div>
                </div>

                {course.topic && (
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-teal-50 rounded-lg">
                      <FiBook className="text-teal-600 text-xl" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Topic</div>
                      <div className="text-sm text-gray-500 capitalize">
                        {course.topic}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
