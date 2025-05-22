/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import CourseCard from "@/app/courses/components/courseCard";
import { CourseData } from "@/utils/types";
import { BookOpen, ChevronDown, Filter, Link, Search } from "lucide-react";
import { use, useEffect, useState } from "react";

export default function StudentEnrolledCoursesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const paramsObj = use(params);
  const userId = parseInt(paramsObj.id);
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("All Topics");
  //   const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        console.log(userId);
        // Fetch enrollments for the student
        const res = await fetch(
          `http://localhost:5001/api/enrollments/student/${userId}`
        );
        const enrollments = await res.json();

        // Extract course data from each enrollment object
        const courseData = enrollments.map(
          (enrollment: any) => enrollment.course
        );
        setCourses(courseData);

        // Fetch progress data for each enrolled course
        // const progressData: Record<string, number> = {};
        // for (const course of courseData) {
        //   try {
        //     const progressRes = await fetch(
        //       `http://localhost:5001/api/progress/student/${userId}/course/${course.id}`
        //     );
        //     const progressInfo = await progressRes.json();
        //     progressData[course.id] = progressInfo.percentComplete || 0;
        //   } catch (err) {
        //     console.log(
        //       `Failed to fetch progress for course ${course.id}:`,
        //       err
        //     );
        //     progressData[course.id] = 0;
        //   }
        // }
        // setProgress(progressData);
      } catch (error) {
        console.log("Failed to fetch enrolled courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [userId]);

  // Extract unique topics from courses
  const topics = ["All Topics"];
  courses.forEach((course) => {
    if (course.topic && !topics.includes(course.topic)) {
      topics.push(course.topic);
    }
  });

  // Filter courses based on searchTerm and selectedTopic
  const filteredCourses = courses.filter((course) => {
    if (!course) return false;

    // Handle missing title more gracefully
    const courseTitle = course.title || "";

    // Handle missing topic - consider it a match if "All Topics" is selected
    const courseTopic = course.topic || "";
    const matchesTopic =
      selectedTopic === "All Topics" || courseTopic === selectedTopic;

    // Case-insensitive search on title
    const matchesSearch = courseTitle
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesTopic && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-teal-50 flex items-center justify-center flex-col">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600 mb-4"></div>
        <p className="text-xl font-semibold text-gray-700">
          Loading your enrolled courses...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-teal-50 pb-20">
      {/* Student Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-purple-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                My Enrolled Courses
              </h1>
              <p className="text-teal-100 text-lg max-w-xl">
                Track your progress and continue learning where you left off.
              </p>
            </div>
            <div className="mt-8 md:mt-0">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg inline-flex items-center">
                <BookOpen className="h-12 w-12 text-white mr-3" />
                <div>
                  <p className="text-sm text-teal-100">Enrolled courses</p>
                  <p className="text-2xl font-bold">{courses.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search enrolled courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-lg border border-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {topics.length > 1 && (
            <div className="relative">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500"
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

      {/* Student Dashboard Link */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-600">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Student Dashboard
              </h2>
              <p className="text-gray-600">
                View your learning analytics and track overall progress
              </p>
            </div>
            <a
              href={`/students/dashboard/${userId}`}
              className="mt-4 md:mt-0 px-6 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-teal-700 transition-colors"
            >
              Open Dashboard
            </a>
          </div>
        </div>
      </div>

      {/* Course Listings */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            {filteredCourses.length}{" "}
            {filteredCourses.length === 1 ? "Course" : "Courses"} Enrolled
          </h2>
          <div className="text-gray-500 text-sm">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-7xl mb-4">😢</div>
            <h3 className="text-2xl font-semibold text-gray-700">
              No enrolled courses found
            </h3>
            <p className="text-gray-500 mt-2">
              Try adjusting your search or filter criteria, or enroll in new
              courses
            </p>
            <Link
              href="/courses/explore"
              className="mt-6 inline-block px-6 py-3 bg-teal-600 text-white font-medium rounded-md hover:bg-teal-700 transition-colors"
            >
              Explore Available Courses
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard
                key={`course-${course.id}`}
                course={course}
                progress={5} // gojamil
                isEnrolled={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
