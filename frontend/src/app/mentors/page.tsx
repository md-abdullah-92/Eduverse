"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FaBuilding,
  FaClock,
  FaEnvelope,
  FaGraduationCap,
} from "react-icons/fa";

type Mentor = {
  id: string;
  name: string;
  email: string;
  teacherProfile: {
    profilePhoto: string;
    specialization: string;
    institution: string;
    experience: string;
    education: string;
  };
};

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const headerVariant = {
  hidden: { opacity: 0, y: -20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/profile/teacher/all"
        );
        const data = await res.json();
        setMentors(data.teachers);
        console.log(
          "Profile photo:",
          data.teachers[0]?.teacherProfile.profilePhoto
        );
      } catch (err: any) {
        console.error("Failed to fetch mentors", err);
        setError("Failed to load mentors.");
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-purple-50 py-16 px-4">
      <motion.div
        variants={headerVariant}
        initial="hidden"
        animate="show"
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Meet Our Mentors
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Connect with industry experts and passionate educators who are here to
          guide your journey
        </p>
      </motion.div>

      {loading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl inline-block">
            {error}
          </div>
        </div>
      )}

      {!loading && mentors.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-7xl mx-auto grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
        >
          {mentors.map((mentor) => (
            <motion.div
              variants={cardVariant}
              key={mentor.id}
              className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-teal-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Profile Image */}
              <div className="relative w-full h-56 overflow-hidden">
                <img
                  src={
                    mentor.teacherProfile.profilePhoto ||
                    "/images/team/minhaz.jpg"
                  }
                  alt={mentor.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/images/team/minhaz.jpg";
                  }}
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {mentor.name}
                </h2>

                <div className="flex items-center gap-2 mb-4">
                  <FaGraduationCap className="text-teal-500 text-sm" />
                  <span className="text-teal-600 font-medium text-sm">
                    {mentor.teacherProfile.specialization}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {mentor.teacherProfile.institution && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <FaBuilding className="text-purple-500 text-xs" />
                      <span>{mentor.teacherProfile.institution}</span>
                    </div>
                  )}
                  {mentor.teacherProfile.experience && (
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <FaClock className="text-purple-500 text-xs" />
                      <span>{mentor.teacherProfile.experience}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {mentor.teacherProfile.education}
                </p>

                {/* Action Button */}
                <a
                  href={`mailto:${mentor.email}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-600 to-purple-600 text-white font-medium rounded-lg hover:from-teal-700 hover:to-purple-700 transition-all duration-200"
                >
                  <FaEnvelope className="text-sm" />
                  Connect via Email
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && mentors.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-teal-500 to-purple-500 rounded-full flex items-center justify-center">
            <FaGraduationCap className="text-white text-xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No mentors found
          </h3>
          <p className="text-gray-600">
            Check back soon for amazing mentors to guide your journey!
          </p>
        </motion.div>
      )}
    </div>
  );
}
