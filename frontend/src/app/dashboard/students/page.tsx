'use client';

import { CourseCard } from '@/components/ui/CourseCard';

export default function StudentDashboard() {
  // This would come from your API/database
  const enrolledCourses = [
    {
      title: 'Introduction to Web Development',
      description: 'Learn the basics of web development with HTML, CSS, and JavaScript',
      image: '/images/course1.png',
      instructor: 'John Doe',
      slug: 'intro-to-web-dev',
      progress: 60
    },
    // Add more courses
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Learning Dashboard</h1>
      
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Enrolled Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <CourseCard key={course.slug} {...course} />
          ))}
        </div>
      </section>
    </div>
  );
}
