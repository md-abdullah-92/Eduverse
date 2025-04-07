'use client';

import React from 'react';


import HeroSection from '@/components/homepage/HeroSection';
import FeaturesSection from '@/components/homepage/FeaturesSection';
import TestimonialsSection from '@/components/homepage/TestimonialsSection';
import CourseCTASection from '@/components/homepage/CourseCTASection';
import PopularCourses from '@/components/homepage/PopularCourses';
import StatsSection from '@/components/homepage/StatsSection';





export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-r from-blue-50 to-sky-100 py-20">
      {/* Hero Section */}
      <HeroSection/>
      {/* Stats Section */}
      <StatsSection/>
      {/* Features Section */}
      <FeaturesSection/>
      {/* Course CTA Section */}
      <CourseCTASection />
      {/* Popular Courses Section */}
      <PopularCourses />
      {/* Testimonials Section */}
      <TestimonialsSection /> 
    </main>
  );
}