"use client";

import { CourseData } from "@/utils/types";
import { useRouter } from "next/navigation";
import React from "react";

import {
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  Play,
  Users,
} from "lucide-react";

const BestSellingCourse: React.FC<{ bestSellingCourse: CourseData }> = ({
  bestSellingCourse,
}) => {
  const router = useRouter();

  return (
    <div className="p-5 bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl text-gray-900 flex items-center space-x-2">
          <Award className="w-6 h-6 text-yellow-500" />
          <span>Best Selling Course</span>
        </h3>
        <button
          onClick={() =>
            router.push(`/teachers/${bestSellingCourse.instructorId}/all`)
          }
          className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center space-x-1"
        >
          <span>View All</span>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="relative w-full lg:w-80 h-52 rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
          {/* Cover Photo */}
          <img
            src={
              bestSellingCourse.coverPhotoUrl ||
              "https://via.placeholder.com/150"
            }
            alt="Course Cover"
            className="w-full h-full object-cover"
          />
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-teal-600/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
          {/* Bestseller Badge */}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm">
            #1 Bestseller
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h4 className="text-xl text-gray-900 mb-2">
              {bestSellingCourse.title}
            </h4>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center space-x-1">
                <BookOpen size={16} />
                <span>{bestSellingCourse.lessons.length} Lessons</span>
              </span>
              <span className="flex items-center space-x-1">
                <Users size={16} />
                <span>{bestSellingCourse.enrollments.length} Students</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar size={16} />
                <span>{bestSellingCourse.lessons.length} Weeks</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-2xl text-teal-600">
              ৳ {bestSellingCourse.price}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-xl text-gray-900">
                {bestSellingCourse.enrollments.length}
              </div>
              <div className="text-sm text-gray-600">Enrollments</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-xl text-green-600">
                {bestSellingCourse.enrollments.length *
                  Number(bestSellingCourse.price)}
              </div>
              <div className="text-sm text-gray-600">Revenue</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-xl text-blue-600">
                {bestSellingCourse.averageRating}
              </div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestSellingCourse;
