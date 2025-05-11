"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Course = {
  id: string;
  title: string;
  coverPhotoUrl: string;
  rating: number;
  reviews: number;
};

export default function PopularCourses() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/courses/all`);
        const data: Course[] = await res.json();
  
        // Sort by rating (descending) and take top 6
        const topCourses = data
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 6);
  
        setCourses(topCourses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };
  
    fetchCourses();
  }, []);
  
  return (
    <motion.section
      id="courses"
      className="bg-[#F9FAFC] py-20"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800">
          Our Popular Courses
        </h2>
        <p className="text-gray-500 mt-2 max-w-xl mx-auto">
          Explore our most popular courses designed to boost your skills.
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
              <button className="mt-4 w-full border border-blue-500 text-blue-500 font-semibold py-2 rounded-md hover:bg-blue-50 transition">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/courses">
          <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-6 rounded-full transition shadow-md">
            See More
          </button>
        </Link>
      </div>
    </motion.section>
  );
}
