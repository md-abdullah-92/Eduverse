'use client';

import React, { useEffect, useState } from 'react';
import ChartCard from '@/app/students/components/ChartCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface TeacherCourseStats {
  courseId: number;
  courseTitle: string;
  averageRating: number;
  totalEnrollments: number;
  answeredQuestions: number;
  unansweredQuestions: number;
}

const COLORS = [
  '#38bdf8', // Sky Blue
  '#34d399', // Green
  '#f97316', // Bright Orange
  '#f472b6', // Pink
  '#a78bfa', // Purple
  '#f87171', // Red
  '#60a5fa', // Light Blue
  '#10b981', // Emerald
  '#e879f9', // Fuchsia
  '#fb923c', // Orange
  '#8b5cf6', // Indigo
  '#ec4899', // Rose
  '#6366f1', // Blue Indigo
  '#14b8a6', // Teal
  '#f43f5e', // Rose Red
  '#22c55e', // Lime Green
  '#c084fc', // Light Purple
  '#0ea5e9', // Cyan Blue
  '#facc15', // (Optional) Yellow - can be replaced
  '#ef4444', // Bright Red
  '#3b82f6', // Vivid Blue
  '#a3e635', // Light Lime
];



const TeacherStatsPage = ({ teacherId }: { teacherId: string }) => {
  const [stats, setStats] = useState<TeacherCourseStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/teacher-stats/${teacherId}`);
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        } else {
          console.error('Failed to fetch stats');
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) fetchStats();
  }, [teacherId]);

  if (loading) {
    return <p className="text-center text-gray-500 py-10">Loading charts...</p>;
  }

  if (stats.length === 0) {
    return <p className="text-center text-gray-500 py-10">No stats available.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Chart 1: Enrollments - Pie Chart */}
      <ChartCard
        title="Course Enrollments Distribution"
        description="Proportion of students enrolled in each course"
      >
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={stats}
              dataKey="totalEnrollments"
              nameKey="courseTitle"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {stats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Chart 2: Average Ratings - Bar Chart */}
      <ChartCard
        title="Average Course Ratings"
        description="How students rated your courses"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="courseTitle" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Bar dataKey="averageRating" fill="#34d399" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

export default TeacherStatsPage;
