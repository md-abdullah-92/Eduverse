"use client";

import { motion } from "framer-motion";
import { jaro, raleway } from "@/utils/font";

const teamMembers = [
  {
    name: "Nobel Ahmad Badhon",
    role: "Frontend Engineer",
    image: "/images/team/badhon.png",
  },
  {
    name: "Minhaz Piash",
    role: "Backend Developer",
    image: "/images/team/minhaz.jpg",
  },
  {
    name: "Abu Kawsar Md Golam Sarwar",
    role: "AI/ML Specialist",
    image: "/images/team/sarwar.jpg",
  },
  {
    name: "Abdullah Al Mahadi Apurbo",
    role: "Database & Infrastructure Engineer",
    image: "/images/team/apurbo.png",
  },
 
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0F4C5C] text-white px-6 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h1 className={`text-5xl font-bold text-center mb-8 ${jaro.className}`}>
          About EduVerse
        </h1>

        <p className={`text-lg text-center text-gray-300 mb-12 ${raleway.className}`}>
          EduVerse is a forward-thinking digital education platform committed to reshaping modern learning through intelligent technology and accessible design.
        </p>

        {/* Mission */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-orange-400 mb-3">Our Mission</h2>
          <p className="text-gray-200 leading-relaxed">
            Our mission is to democratize access to high-quality education by leveraging cutting-edge technologies such as artificial intelligence, real-time interactivity, and scalable cloud architecture. EduVerse aspires to empower individuals by providing personalized, flexible, and enriching educational experiences tailored to diverse learning needs.
          </p>
        </section>

        {/* Vision */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-orange-400 mb-3">Our Vision</h2>
          <p className="text-gray-200 leading-relaxed">
            We envision a global learning environment where barriers to education no longer exist — a space where every student, regardless of background or location, has the opportunity to grow through intelligent and engaging learning systems.
          </p>
        </section>

        {/* Unique Value */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-orange-400 mb-3">What Sets Us Apart</h2>
          <ul className="list-disc list-inside text-gray-200 space-y-2">
            <li>AI-powered personalized learning paths</li>
            <li>Real-time interactive classrooms and collaboration tools</li>
            <li>Automated assessment and intelligent feedback systems</li>
            <li>Secure, modular microservices architecture</li>
            <li>A global network of learners, educators, and contributors</li>
          </ul>
        </section>

        {/* Team Section */}
        <section className="mt-20">
          <h2 className="text-3xl font-semibold text-orange-400 mb-10 text-center">
            Meet Our Team
          </h2>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/10 border border-white/20 p-6 rounded-xl text-center shadow-lg hover:bg-white/20 transition"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 mx-auto rounded-full object-cover mb-4 border-4 border-orange-400"
                />
                <h3 className="text-xl font-semibold text-white">{member.name}</h3>
                <p className="text-sm text-gray-300 mt-1">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-20 text-center">
          <a
            href="/register"
            className="inline-block bg-orange-500 hover:bg-orange-400 transition text-white px-6 py-3 rounded text-lg font-semibold"
          >
            Join the EduVerse
          </a>
        </div>
      </div>
    </div>
  );
}
