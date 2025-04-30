'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import HeroSection from '@/components/homepage/HeroSection';
import FeaturesSection from '@/components/homepage/FeaturesSection';
import TestimonialsSection from '@/components/homepage/TestimonialsSection';
import CourseCTASection from '@/components/homepage/CourseCTASection';
import PopularCourses from '@/components/homepage/PopularCourses';
import StatsSection from '@/components/homepage/StatsSection';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard/teacher'); // 🔁 Change to your desired profile route
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#F9FAFC]">
      {/* Hero Section */}
      <HeroSection />
      {/* Stats Section */}
      <StatsSection />
      {/* Features Section */}
      <FeaturesSection />
      {/* Course CTA Section */}
      <CourseCTASection />
      {/* Popular Courses Section */}
      <PopularCourses />
      {/* Testimonials Section */}
      <TestimonialsSection />
    </main>
  );
}
