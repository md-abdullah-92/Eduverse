"use client";

import { API_URLS } from "@/lib/api/urls";
import CourseCard from "@/app/courses/components/courseCard";
import { CourseData, TeacherStats } from "@/utils/types";
import {
  BookOpen,
  ChevronDown,
  Filter,
  GraduationCap,
  Link,
  Search,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

import LoadingIndicator from "@/components/ui_elements/loadingIndicator";
import { poppins, raleway } from "@/utils/font";

export default function AllCoursesByInstructorPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = params.id;
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("All Topics");
  const [teacherStats, setTeacherStats] = useState<TeacherStats>();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(
          `${API_URLS.course}/courses/getByInstructorId/${userId}`
        );
        const data: CourseData[] = await res.json();
        setCourses(data);
      } catch (error) {
        console.log("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTeacherStats = async () => {
      try {
        const res = await fetch(
          `${API_URLS.course}/enrollments/stats/teacher/${userId!}`
        );
        const stats = await res.json();
        const data: TeacherStats = stats.data;
        setTeacherStats(data);
      } catch (error) {
        console.log("Failed to fetch enrollments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
    fetchTeacherStats();
  }, [userId, courses]);

  // Extract unique topics from courses
  const topics = ["All Topics"];
  courses.forEach((course) => {
    if (course.topic && !topics.includes(course.topic)) {
      topics.push(course.topic);
    }
  });

  // Filter courses based on searchTerm and selectedTopic
  const filteredCourses = courses.filter((course) => {
    const courseTitle = course.title || "";
    const courseTopic = course.topic || "";

    const matchesTopic =
      selectedTopic === "All Topics" || courseTopic === selectedTopic;
    const matchesSearch = courseTitle
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesTopic && matchesSearch;
  });

  // Show loading state while fetching courses
  if (loading) {
    return <LoadingIndicator text="Loading instructor courses..." />;
  }

  return (
    <div
      className={`min-h-screen min-w-0 overflow-x-hidden bg-gradient-to-b from-white to-teal-50 pb-20 ${poppins.className}`}
    >
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-purple-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-14">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="min-w-0 text-center md:text-left">
              <h1
                className={`mb-4 text-3xl font-bold sm:text-4xl md:text-5xl ${raleway.className}`}
              >
                Instructor Dashboard
              </h1>
              <p className="mx-auto max-w-xl text-base text-teal-100 sm:text-lg md:mx-0">
                Manage your courses, track student engagement, and monitor your
                teaching progress.
              </p>
            </div>

            {/* Quick Stats Card */}
            <div className="w-full max-w-sm rounded-2xl bg-white/10 p-4 backdrop-blur-sm sm:p-6 md:mt-0 md:w-auto md:min-w-[17.5rem]">
              <div className="flex items-center justify-center mb-4">
                <BookOpen className="h-12 w-12 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">
                    {teacherStats?.totalCourses}
                  </p>
                  <p className="text-sm text-teal-100">Total Courses</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {teacherStats?.totalLessons}
                  </p>
                  <p className="text-sm text-teal-100">Total Lessons</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Overview Card */}
      <div className="relative z-10 mx-auto -mt-5 w-full max-w-7xl px-3 sm:-mt-8 sm:px-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-6">
            <div className="flex items-center space-x-4">
              <div className="bg-teal-100 rounded-full p-3">
                <GraduationCap className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {teacherStats?.totalCourses}
                </p>
                <p className="text-sm text-gray-600">Total Courses</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 rounded-full p-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {teacherStats?.totalStudents}
                </p>
                <p className="text-sm text-gray-600">Total Students</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-green-100 rounded-full p-3">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {teacherStats?.totalLessons}
                </p>
                <p className="text-sm text-gray-600">Total Lessons</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mx-auto mt-8 w-full max-w-7xl px-3 sm:mt-12 sm:px-6">
        <div className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-lg sm:gap-4 sm:p-6 md:flex-row">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search your courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-lg border border-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {topics.length > 1 && (
            <div className="relative w-full md:w-auto md:min-w-48">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {topics.map((topic, index) => (
                  <option key={`topic-${index}`} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Course Grid */}
      <div className="mx-auto mt-8 w-full max-w-7xl px-3 sm:mt-12 sm:px-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-2 sm:mb-8 sm:flex-row sm:items-center">
          <h2
            className={`text-xl font-bold text-gray-800 sm:text-2xl ${raleway.className}`}
          >
            {filteredCourses.length}{" "}
            {filteredCourses.length === 1 ? "Course" : "Courses"}
          </h2>
          <div className="text-gray-500 text-sm">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-7xl mb-4">😢</div>
            <h3
              className={`text-2xl font-semibold text-gray-700 ${raleway.className}`}
            >
              No courses found
            </h3>
            <p className="text-gray-500 mt-2">
              Try adjusting your search or filter criteria, or create new
              courses.
            </p>
            <Link
              href="/courses/create"
              className="mt-6 inline-block px-6 py-3 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 transition-colors"
            >
              Create New Course
            </Link>
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} isEnrolled={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
