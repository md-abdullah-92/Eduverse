'use client';

import Link from 'next/link';
import { CourseCard } from '@/components/ui/CourseCard';

export default function TeacherDashboard() {
  // This would come from your API/database
  const teacherCourses = [
    {
      title: 'Advanced JavaScript',
      description: 'Master JavaScript with advanced concepts and patterns',
      image: '/images/course2.png',
      instructor: 'Jane Smith',
      slug: 'advanced-javascript',
      students: 120
    },
    // Add more courses
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <Link 
          href="/dashboard/teachers/create-course"
          className="bg-sky-900 text-white px-4 py-2 rounded-md hover:bg-sky-800 transition-colors"
        >
          Create New Course
        </Link>
      </div>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Your Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherCourses.map((course) => (
            <CourseCard key={course.slug} {...course} />
          ))}
        </div>
      </section>
    </div>
  );
}
