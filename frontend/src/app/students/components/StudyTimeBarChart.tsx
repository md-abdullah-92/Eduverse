'use client';

import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useStudentProfile } from '@/hooks/useStudentProfile';
import ChartCard from '../components/ChartCard';

const radius = 90;
const circumference = 2 * Math.PI * radius;

function getGrade(score: number): string {
  if (score >= 80) return 'A+';
  if (score >= 75) return 'A';
  if (score >= 70) return 'B';
  if (score >= 65) return 'C';
  if (score >= 60) return 'D';
  if (score >= 50) return 'E';
  return 'F';
}

const userId =
  typeof window !== 'undefined' ? localStorage.getItem('userId') || 'default' : 'default';

export default function StudyTimeBarChart() {
  const { profile, loading } = useStudentProfile(userId);
  const [average, setAverage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const refreshData = () => {
    if (profile?.quizResults?.length) {
      const quizzes = profile.quizResults;
      const percentages = quizzes.map((q) => (q.marks / q.fullmark) * 100);
      const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length;

      setAverage(avg);
      setAttempts(quizzes.length);

      // animate
      setProgress(0);
      setTimeout(() => {
        setProgress((circumference * avg) / 100);
      }, 300);
    }
  };

  useEffect(() => {
    if (profile?.quizResults?.length) {
      refreshData();
    }
  }, [profile]);

  const grade = getGrade(average);

  return (
    <ChartCard
      title="Average Score & Grade"
      description="Overall performance based on your quiz attempts"
      action={
        <button
          onClick={refreshData}
          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
        >
          <RotateCcw className="w-4 h-4" />
          Refresh
        </button>
      }
    >
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading average data...</div>
      ) : (
        <div className="relative w-72 h-72 mx-auto">
          <svg className="w-full h-full transform -rotate-90">
            <defs>
              <linearGradient id="avgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>

            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="#E5E7EB"
              strokeWidth="18"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="url(#avgGradient)"
              strokeWidth="18"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out drop-shadow"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold text-indigo-700">{average.toFixed(1)}%</span>
            <span className="text-md text-gray-500">Average Score</span>
            <span className="text-sm text-gray-400">{attempts} attempts</span>
            <span className="mt-2 text-lg font-semibold text-green-600">Grade: {grade}</span>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
