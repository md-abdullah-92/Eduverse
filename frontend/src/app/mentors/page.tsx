"use client";

import { useEffect, useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";

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
      staggerChildren: 0.2,
    },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/profile/teacher/all");
        setMentors(res.data.teachers);
        console.log("Profile photo:", res.data.teachers[0]?.teacherProfile.profilePhoto);
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
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen py-12 px-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold text-center text-blue-800 mb-6"
      >
        Meet Our Mentors
      </motion.h1>

      {loading && <p className="text-center text-gray-500">Loading mentors...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && mentors.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-7xl mx-auto grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {mentors.map((mentor) => (
            <motion.div
              variants={cardVariant}
              key={mentor.id}
              className="bg-white shadow-lg rounded-2xl overflow-hidden transform transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="relative w-full h-60">
                <img
                  src={mentor.teacherProfile.profilePhoto || "/images/team/minhaz.jpg"}
                  alt={mentor.name}
                  className="w-full h-full object-cover rounded-t-2xl"
                  onError={(e) => {
                    e.currentTarget.src = "/images/team/minhaz.jpg";
                  }}
                />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-800">{mentor.name}</h2>
                <p className="text-sm text-blue-700 mt-1 font-medium">
                  {mentor.teacherProfile.specialization}
                </p>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                  {mentor.teacherProfile.education}
                </p>

                <div className="mt-5 flex gap-3">
                  <a
                    href={`mailto:${mentor.email}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                  >
                    <FaEnvelope />
                    Email
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && mentors.length === 0 && (
        <p className="text-center text-gray-600 mt-10">No mentors found.</p>
      )}
    </div>
  );
}
