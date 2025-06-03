"use client";

import CourseCard from "@/app/courses/components/courseCard";
import { CourseData } from "@/utils/types";
import { BarChart2, ChevronDown, Filter, Search } from "lucide-react";
import { useEffect, useState } from "react";

import {
  poppins,
  dmSerif,
  playfair
} from "@/utils/font";
export default function AllCoursesByInstructorPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = params.id;
  // const { user } = useAuth();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("All Topics");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(
          `http://localhost:5001/api/courses/getByInstructorId/${userId}`
        );
        const data: CourseData[] = await res.json();
        setCourses(data);
      } catch (error) {
        console.log("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId]);

  // Extract unique topics from courses
  const topics = [
    "All Topics",
    ...new Set(courses.map((course) => course.topic).filter(Boolean)),
  ];

  // Filter courses based on searchTerm and selectedTopic
  const filteredCourses = courses.filter((course) => {
    const matchesTopic =
      selectedTopic === "All Topics" || course.topic === selectedTopic;
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  // Show loading state while fetching courses
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center flex-col font-poppins">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-xl font-semibold text-gray-700">
          Loading instructor courses...
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-blue-50 pb-20 ${poppins.className}`}>
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-purple-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${dmSerif.className}`}>
              Your Courses
            </h1>
            <p className="text-purple-100 text-lg max-w-xl">
              Browse all courses created by this instructor and access their dashboards.
            </p>
          </div>
          <div className="mt-8 md:mt-0">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg inline-flex items-center">
              <BarChart2 className="h-12 w-12 text-white mr-3" />
              <div>
                <p className="text-sm text-purple-100">Total courses</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-lg border border-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {topics.length > 1 && (
            <div className="relative">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {topics.map((topic) => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Dashboard CTA */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-600">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className={`text-xl font-bold text-gray-800 ${playfair.className}`}>
                Instructor Dashboard
              </h2>
              <p className="text-gray-600">
                Access your instructor dashboard to view analytics and manage your courses.
              </p>
            </div>
            <a
              href={`/teachers/dashboard/${userId}`}
              className="mt-4 md:mt-0 px-6 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
            >
              Open Dashboard
            </a>
          </div>
        </div>
      </div>

      {/* Course List */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className={`text-2xl font-bold text-gray-800 ${dmSerif.className}`}>
            {filteredCourses.length} {filteredCourses.length === 1 ? "Course" : "Courses"} Available
          </h2>
          <div className="text-gray-500 text-sm">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-7xl mb-4">😢</div>
            <h3 className="text-2xl font-semibold text-gray-700">
              No courses found
            </h3>
            <p className="text-gray-500 mt-2">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} isEnrolled={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
