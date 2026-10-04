'use client';

import ChartCard from '../components/ChartCard';
import type { StudentProfile } from '@/hooks/useStudentProfile';

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

export default function StudyTimeBarChart({ profile }: { profile: StudentProfile }) {
  const quizzes = (profile.quizResults ?? []).filter(
    (quiz) => quiz.fullmark > 0 && Number.isFinite(quiz.marks)
  );
  const average = quizzes.length
    ? quizzes.reduce((total, quiz) => total + (quiz.marks / quiz.fullmark) * 100, 0) /
      quizzes.length
    : 0;
  const progress = (circumference * Math.min(Math.max(average, 0), 100)) / 100;
  const attempts = quizzes.length;

  const grade = getGrade(average);

  return (
    <ChartCard
      title="Average Score & Grade"
      description="Overall performance based on your quiz attempts"
    >
      {attempts === 0 ? (
        <div className="flex h-full items-center justify-center text-center text-gray-500">
          No graded exam results yet.
        </div>
      ) : (
        <div className="relative mx-auto aspect-square w-full max-w-[18rem]">
          <svg viewBox="0 0 240 240" className="h-full w-full -rotate-90">
            <defs>
              <linearGradient id="avgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>

            <circle
              cx="120"
              cy="120"
              r={radius}
              stroke="#E5E7EB"
              strokeWidth="18"
              fill="transparent"
            />
            <circle
              cx="120"
              cy="120"
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
