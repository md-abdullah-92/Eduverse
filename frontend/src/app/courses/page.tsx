/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@/app/auth/context";
import CourseCard from "@/app/courses/components/courseCard";
import { CourseData, CourseInfo } from "@/utils/types";
import { BookOpen, ChevronDown, Filter, Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function AllCoursesPage() {
  const { user } = useAuth();
  const isStudent = user?.role === "STUDENT";
  const isLoggedIn = !!user;

  const [courses, setCourses] = useState<CourseData[]>([]);
  const [enrolledCourseInfo, setEnrolledCourseInfo] = useState<CourseInfo[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [enrollmentLoading, setEnrollmentLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("All Topics");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/courses/all`);
        const data: CourseData[] = await res.json();
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!isLoggedIn || !isStudent || !user?.id) {
        return;
      }

      setEnrollmentLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5001/api/enrollments/student/${user.id}`
        );
        if (res.ok) {
          const enrollments = await res.json();
          // Extract course IDs from enrollments
          const courseInfo = enrollments.map((enrollment: any) => ({
            id: enrollment.courseId,
            progress: Number(enrollment.progressPercentage) || 0,
          }));
          setEnrolledCourseInfo(courseInfo);
        } else {
          console.error("Failed to fetch enrollments");
        }
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      } finally {
        setEnrollmentLoading(false);
      }
    };

    fetchEnrollments();
  }, [isLoggedIn, isStudent, user?.id]);

  // Extract unique topics from courses
  const topics = [
    "All Topics",
    ...new Set(courses.map((course) => course.topic)),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center flex-col">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-4"></div>
        <p className="text-xl font-semibold text-gray-700">
          Loading amazing courses for you...
        </p>
      </div>
    );
  }

  const getGreeting = () => {
    if (!isLoggedIn) {
      return "Discover Amazing Courses";
    }
    if (isStudent) {
      return "Assalamu Alaikum, Discover Next Skills";
    }
    return "Assalamu Alaikum, Explore Courses";
  };

  const getSubtitle = () => {
    if (!isLoggedIn) {
      return "Browse our library of top-rated courses taught by industry experts. Sign up to start learning!";
    }
    return "Browse our library of top-rated courses taught by industry experts and take your skills to the next level.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pb-20">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-purple-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-medium mb-4">
                {getGreeting()}
              </h1>
              <br />
              <p className="text-purple-100 text-lg max-w-xl">
                {getSubtitle()}
              </p>

              {/* Show login prompt for non-logged in users */}
              {!isLoggedIn && (
                <div className="mt-6">
                  <a
                    href="/auth/login"
                    className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg hover:bg-white/30 transition-colors"
                  >
                    Sign In to Start Learning
                  </a>
                </div>
              )}
            </div>
            <div className="mt-8 md:mt-0">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg inline-flex items-center">
                <BookOpen className="h-12 w-12 text-white mr-3" />
                <div>
                  <p className="text-sm text-purple-100">Our collection</p>
                  <p className="text-2xl font-bold">{courses.length} Courses</p>
                  {isLoggedIn && isStudent && (
                    <p className="text-sm text-purple-200">
                      {enrolledCourseInfo.length} Enrolled
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-4 border border-gray-100">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-lg border border-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
            />
          </div>

          <div className="relative">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg py-3 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {topics.map((topic) => (
                <option key={topic} value={topic} className="text-gray-700">
                  {topic}
                </option>
              ))}
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Loading indicator for enrollments */}
      {enrollmentLoading && isLoggedIn && isStudent && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
              <p className="text-blue-700 text-sm">
                Loading your enrollment status...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Course Listings */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredCourses.length}{" "}
            {filteredCourses.length === 1 ? "Course" : "Courses"} Available
          </h2>
          <div className="text-gray-500 text-sm">
            Showing {filteredCourses.length} of {courses.length} courses
            {isLoggedIn && isStudent && !enrollmentLoading && (
              <span className="ml-2 text-purple-600">
                • {enrolledCourseInfo.length} enrolled
              </span>
            )}
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg p-8">
            <div className="text-gray-400 text-7xl mb-4">😢</div>
            <h3 className="text-xl font-semibold text-gray-700">
              No courses found
            </h3>
            <p className="text-gray-500 mt-2">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isEnrolled={enrolledCourseInfo
                  .map((info) => info.id === course.id)
                  .includes(true)}
                progress={Number(
                  enrolledCourseInfo
                    .find((info) => info.id === course.id)
                    ?.progress?.toFixed(2)
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer message for non-logged in users */}
      {!isLoggedIn && (
        <div className="max-w-7xl mx-auto px-4 mt-16">
          <div className="bg-gradient-to-r from-teal-50 to-purple-50 border border-teal-200 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Ready to Start Learning?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join thousands of students already learning with our expert-led
              courses. Create your account to access course materials, track
              progress, and earn certificates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/signup"
                className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                Create Account
              </a>
              <a
                href="/auth/login"
                className="px-8 py-3 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-medium"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
