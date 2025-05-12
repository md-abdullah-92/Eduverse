"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Course = {
  id: string;
  title: string;
  image: string;
  coverPhotoUrl: string;
  rating: number;
  reviews: number;
};

export default function AllCoursesByInstructorPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = params.id;
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(
          `http://localhost:5001/api/courses/getByInstructorId/${userId}`
        );
        const data: Course[] = await res.json();
        setCourses(data);
        console.log(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center flex-col">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sky-900 mb-4"></div>
        <p className="text-xl font-semibold text-gray-700">
          Loading courses, please wait...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFC] py-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800">
          All Courses of {userId}
        </h2>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto">
          Browse all our available courses to find what suits your needs.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 px-4 max-w-7xl mx-auto">
        {courses.map((course) => (
          <div
            key={course.id}
            className="shadow-lg rounded-2xl overflow-hidden bg-white"
          >
            <div className="w-full h-52 relative">
              <Image
                src={course.coverPhotoUrl}
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-800">
                {course.title}
              </h3>
              <div className="flex items-center mt-2 text-yellow-400">
                {"★".repeat(Math.floor(course.rating))}
                <span className="text-gray-600 text-sm ml-2">
                  {course.rating}.0 ({course.reviews} rating)
                </span>
              </div>
              <Link href={`/teachers/${userId}/course_dashboard/${course.id}`}>
                <button className="mt-4 w-full border border-blue-500 text-blue-500 font-semibold py-2 rounded-md hover:bg-blue-50 transition">
                  DashBoard
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
