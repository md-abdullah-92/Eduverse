"use client";

import {
  BookOpen,
  Calendar,
  ChevronRight,
  Eye,
  Play,
  Users,
} from "lucide-react";

// Define the type for a Course
interface Course {
  id?: string | number;
  title?: string;
  thumbnail?: string;
  progress?: number;
  enrolledCount?: number;
  duration?: string;
}

// Define the type for Student
interface Student {
  name: string;
  recentCourses?: Course[];
}

// Props type
interface RecentCoursesProps {
  student: Student;
}

const RecentCourses: React.FC<RecentCoursesProps> = ({ student }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-teal-500" />
          <span>Recent Courses</span>
        </h3>
        <button className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center space-x-1">
          <span>View All</span>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {student.recentCourses && student.recentCourses.length > 0
          ? student.recentCourses
              .slice(0, 3)
              .map((course, index) => (
                <div
                  key={course.id || index}
                  className="bg-white/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${
                          index === 0
                            ? "from-teal-500 to-purple-600"
                            : index === 1
                            ? "from-green-500 to-teal-600"
                            : "from-orange-500 to-red-600"
                        }`}
                      />
                    )}

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {course.progress || 0}% Complete
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                      {course.title || `Course ${index + 1}`}
                    </h4>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Users size={14} />
                        <span>{course.enrolledCount || 0} students</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{course.duration || "N/A"}</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${
                          index === 0
                            ? "from-teal-500 to-purple-600"
                            : index === 1
                            ? "from-green-500 to-teal-600"
                            : "from-orange-500 to-red-600"
                        }`}
                        style={{ width: `${course.progress || 0}%` }}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 text-sm">
                        <Play size={14} />
                        <span>Continue</span>
                      </button>
                      <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm">
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
          : // Fallback UI if no courses
            [1, 2, 3].map((index) => (
              <div
                key={index}
                className="bg-white/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      index === 1
                        ? "from-teal-500 to-purple-600"
                        : index === 2
                        ? "from-green-500 to-teal-600"
                        : "from-orange-500 to-red-600"
                    }`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-full text-xs font-semibold">
                    {Math.floor(Math.random() * 80) + 10}% Complete
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                    Sample Course {index}
                  </h4>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Users size={14} />
                      <span>
                        {Math.floor(Math.random() * 500) + 100} students
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{Math.floor(Math.random() * 10) + 2}h</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${
                        index === 1
                          ? "from-teal-500 to-purple-600"
                          : index === 2
                          ? "from-green-500 to-teal-600"
                          : "from-orange-500 to-red-600"
                      }`}
                      style={{
                        width: `${Math.floor(Math.random() * 80) + 10}%`,
                      }}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 text-sm">
                      <Play size={14} />
                      <span>Continue</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm">
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default RecentCourses;
