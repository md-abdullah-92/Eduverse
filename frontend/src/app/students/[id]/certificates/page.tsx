"use client";

import { useAuth } from "@/app/auth/context";
import { ErrorDisplay } from "@/components/ui_elements/ErrorDisplay";
import LoadingIndicator from "@/components/ui_elements/loadingIndicator";
import { playfair } from "@/utils/font";
import { Enrollment } from "@/utils/types";
import { Award, BookOpen, Clock, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Common-Components/Sidebar";
import { Input } from "@/components/ui/input";

export default function CompletedCoursesList() {
  const [completedCourses, setCompletedCourses] = useState<Enrollment[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchCompletedCourses();
    } else {
      setLoading(false);
      setError("No student ID found. Please log in again.");
    }
  }, [user]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = completedCourses.filter(
      (c) =>
        c.course.title.toLowerCase().includes(query) ||
        c.course.topic.toLowerCase().includes(query)
    );
    setFilteredCourses(filtered);
  }, [searchQuery, completedCourses]);

  const fetchCompletedCourses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError("");
      const response = await fetch(
        `http://localhost:5001/api/enrollments/stats/${user.id}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const courses = data?.data.completedCoursesData || [];
      setCompletedCourses(courses);
      setFilteredCourses(courses);
    } catch (err) {
      setError("Failed to fetch completed courses");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId: number) => {
    router.push(`/certificates/${courseId}`);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4">
        <Sidebar userId={String(user?.id)} role={user?.role || "STUDENT"} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-6 py-10 overflow-auto">
        {loading ? (
          <LoadingIndicator text="Loading completed courses..." />
        ) : error ? (
          <ErrorDisplay error={error} onRetry={fetchCompletedCourses} />
        ) : completedCourses.length === 0 ? (
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center space-y-2">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-900">
                No Completed Courses Yet
              </h3>
              <p className="text-gray-600">
                Complete your first course to earn a certificate!
              </p>
            </div>
          </div>
        ) : (
          <section className="max-w-7xl mx-auto space-y-10">
            {/* Header with Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <h1
                  className={`text-4xl font-bold text-teal-800 ${playfair.className}`}
                >
                  Completed Courses
                </h1>
                <p className="text-gray-700 mt-1 text-base">
                  You’ve completed{" "}
                  <span className="font-semibold text-teal-700">
                    {completedCourses.length}
                  </span>{" "}
                  course
                  {completedCourses.length !== 1 && "s"}. Click a card to view
                  your certificate.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Search className="w-5 h-5 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search by title or topic"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64"
                />
              </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((enrollment) => (
                <Card
                  key={enrollment.course.id}
                  onClick={() => handleCourseClick(enrollment.courseId)}
                  className="transition shadow-sm border border-teal-300 hover:shadow-lg hover:border-teal-500 cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={enrollment.course.coverPhotoUrl || ""}
                      alt={enrollment.course.title}
                      className="w-full h-48 object-cover rounded-t-md group-hover:brightness-90 transition"
                    />
                    <Badge
                      variant="default"
                      className="absolute top-3 right-3 bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <Award className="w-4 h-4 mr-1" />
                      Completed
                    </Badge>
                  </div>

                  <CardHeader>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 w-fit text-xs">
                      {enrollment.course.topic}
                    </Badge>
                    <CardTitle className="text-lg text-teal-800 font-semibold line-clamp-2">
                      {enrollment.course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm text-gray-500">
                      {enrollment.course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-teal-600" />
                      <span>Instructor: {enrollment.course.instructorId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-600" />
                      <span>
                        Duration: {enrollment.course.lessons?.length ?? 0}{" "}
                        lessons
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-teal-600" />
                      <span>
                        Lessons Completed:{" "}
                        {enrollment.course.lessons?.length ?? 0}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                      <Award className="w-4 h-4 mr-2" />
                      View Certificate
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
