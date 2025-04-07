'use client';

import { motion } from 'framer-motion';


import React from 'react';
import { User, Clock, Monitor, DollarSign } from 'lucide-react';
import { Play } from 'lucide-react';
import Image from 'next/image';
import Link from "next/link";
//import PopularCourses from "@/components/PopularCourses";


const stats = [
  { value: '8200', label: 'Success Stories' },
  { value: '12200', label: 'Expert Mentors' },
  { value: '50000', label: 'Hours Course' },
  { value: '70000', label: 'Active Student' },
];
const benefits = [
  {
    title: 'One on One Monitor',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
    icon: <User className="text-white" />,
    bg: 'bg-blue-600',
  },
  {
    title: '24/7 Mentor',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
    icon: <Clock className="text-white" />,
    bg: 'bg-lime-600',
  },
  {
    title: 'Whiteboard',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
    icon: <Monitor className="text-white" />,
    bg: 'bg-pink-600',
  },
  {
    title: 'Affordable Price',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting',
    icon: <DollarSign className="text-white" />,
    bg: 'bg-orange-500',
  },
];
const courses = [
  {
    title: "Web Design Basic to advance",
    image: "/images/web-design.jpg",
    rating: 5,
    reviews: 2,
  },
  {
    title: "Web Development Basic to advance",
    image: "/images/web-development.jpg",
    rating: 5,
    reviews: 2,
  },
  {
    title: "Digital Marketing Basic to advance",
    image: "/images/digital-marketing.jpg",
    rating: 5,
    reviews: 2,
  },
  {
    title: "App Design Basic to advance",
    image: "/images/app-design.jpg",
    rating: 5,
    reviews: 2,
  },
  {
    title: "Mobile Design Basic to advance",
    image: "/images/mobile-design.jpg",
    rating: 5,
    reviews: 2,
  },
  {
    title: "Graphics Design Basic to advance",
    image: "/images/graphics-design.jpg",
    rating: 5,
    reviews: 2,
  },
];

const testimonials = [
  {
    name: 'Beth Luna',
    image: '/beth.jpg',
    stars: 5,
    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took',
  },
  {
    name: 'Belinda Gomez',
    image: '/belinda.jpg',
    stars: 5,
    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took',
  },
  {
    name: 'Howard Clayton',
    image: '/howard.jpg',
    stars: 5,
    text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-r from-blue-50 to-sky-100 py-20">
      {/* Hero Section */}
      <motion.section
        id="home"
        className="bg-gradient-to-r from-blue-50 to-sky-100 py-20"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          {/* Left Text */}
          <motion.div
            className="md:w-1/2 mb-12 md:mb-0 pl-16"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <h1 className="text-5xl font-semibold text-[#0f172a] leading-snug mb-6">
              Scale your<br />Learning with<br />the power of AI
            </h1>
            <p className="text-xl text-[#374151] font-semibold">
              JOIN US <span className="font-bold text-black">FOR FREE</span>
            </p>
          </motion.div>

          {/* Right Visual Grid */}
          <motion.div
            className="md:w-1/2 grid grid-cols-[auto_auto] gap-x-4 gap-y-4 justify-center items-center"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              whileHover={{ scale: 1.15 }}
              className="w-40 h-40 rounded-full bg-blue-200 overflow-hidden flex items-center justify-center transition-transform"
            >
              <img src="/images/person1.png" alt="Person 1" className="w-full h-full object-cover" />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-40 h-40 bg-pink-300 rounded-xl overflow-hidden flex items-center justify-center transition-transform"
            >
              <img src="/images/person2.png" alt="Person 2" className="w-full h-full object-cover" />
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-40 h-40 bg-yellow-300 rounded-lg transition-transform"
            />

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-40 h-40 bg-gray-300 rounded-br-[80px] rounded-tr-[80px] transition-transform"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="bg-teal-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="px-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-4xl font-extrabold">{stat.value}</h3>
                <p className="text-base mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section
        id="home"
        className="bg-gradient-to-r from-blue-50 to-sky-100 py-20"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-sky-900 mb-4">Benefits of Online Education</h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Discover how online learning empowers flexibility, accessibility, and personalized education.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {benefits.map((item, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-md p-6 text-left"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.bg}`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Video Section */}
      <motion.section
         className="bg-gradient-to-r from-blue-50 to-sky-100 py-20"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col-reverse md:flex-row items-center gap-12">
          {/* Left side - stacked video thumbnails */}
          <div className="relative w-full md:w-1/2 flex justify-center items-center">
            {/* Back box */}
            <div className="w-64 h-64 bg-sky-200 rounded-xl absolute top-0 left-0 translate-x-10 -translate-y-10 z-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Play className="text-sky-600" />
              </div>
            </div>
            {/* Front box with image */}
            <div className="w-64 h-64 bg-yellow-300 rounded-xl z-10 overflow-hidden relative flex items-center justify-center">
              <Image
                src="/images/student.png"
                alt="Student"
                fill
                className="object-cover"
              />
              <div className="absolute w-12 h-12 bg-white rounded-full flex items-center justify-center z-20">
                <Play className="text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Right side - text content */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              We are Always Ensure<br />Best Course for your learning
            </h2>
            <p className="text-gray-600 mb-6">
              Lorem Ipsum is simply dummy text of the printing and IT typesetting industry. Lorem Ipsum has been the
            </p>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-6 rounded-full transition duration-300">
              Join Us Free
            </button>
          </div>
        </div>
      </motion.section>

      {/* Popular Courses Section */}
      <motion.section
        id="courses"
        className="bg-gradient-to-r from-blue-50 to-sky-100 py-20"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800">Our Popular Courses</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">
              Explore our most popular courses designed to boost your skills.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 px-4 max-w-7xl mx-auto">
            {courses.map((course, index) => (
              <div key={index} className="shadow-lg rounded-2xl overflow-hidden bg-white">
                <div className="w-full h-52 relative">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800">{course.title}</h3>
                  <div className="flex items-center mt-2 text-yellow-400">
                    {'★'.repeat(course.rating)}
                    <span className="text-gray-600 text-sm ml-2">5.0 ({course.reviews} rating)</span>
                  </div>
                  <button className="mt-4 w-full border border-blue-500 text-blue-500 font-semibold py-2 rounded-md hover:bg-blue-50 transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* See More Button */}
          <div className="mt-10 text-center">
            <Link href="/courses">
              <button className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-6 rounded-full transition shadow-md">
                See More
              </button>
            </Link>
          </div>
        
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        id="testimonials"
         className="bg-gradient-to-r from-blue-50 to-sky-100 py-20 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true, amount: 0.2 }}
      >
        
          <h2 className="text-4xl font-bold text-[#1f1f4e]">What our Students say</h2>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto">
            Hear what our students have to say about their experience.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow-md text-left">
                <h3 className="text-lg font-semibold text-[#1f1f4e]">Great Platform</h3>
                <span className="text-3xl text-[#1f1f4e] mt-2">“</span>
                <p className="text-sm text-gray-600 mt-2">{testimonial.text}</p>
                <hr className="my-4" />
                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <div className="text-yellow-400 text-sm">
                      {'★'.repeat(testimonial.stars)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        
      </motion.section>
    </main>
  );
}