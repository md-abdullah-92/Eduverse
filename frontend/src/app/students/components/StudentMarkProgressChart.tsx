"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "../components/ChartCard";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import { useEffect, useState } from "react";

type QuizPerformance = {
  title: string;
  marksObtained: number;
  totalMarks: number;
};

const extractRecentQuizPerformance = (profile: StudentProfile): QuizPerformance[] => {
  if (!profile.quizResults) return [];
  return profile.quizResults
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((result) => ({
      title: result.title,
      marksObtained: result.marks,
      totalMarks: result.fullmark,
    }));
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const { exam, marksObtained, totalMarks } = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md text-sm text-gray-800 font-medium">
        <p className="text-base font-semibold text-indigo-600">{exam}</p>
        <p>
          Score: <span className="font-bold text-blue-600">{marksObtained}</span>
        </p>
        <p>
          Full Mark: <span className="font-bold text-emerald-600">{totalMarks}</span>
        </p>
      </div>
    );
  }
  return null;
};

const userId =
  typeof window !== "undefined" ? localStorage.getItem("userId") || "default" : "default";

const StudentMarkProgressChart = () => {
  const { profile, isLoading } = useStudentProfile(userId);
  const [chartData, setChartData] = useState<
    { exam: string; marksObtained: number; totalMarks: number }[]
  >([]);

  useEffect(() => {
    if (profile?.quizResults) {
      const recentPerformance = extractRecentQuizPerformance(profile);
      const formattedData = recentPerformance.map((quiz) => ({
        exam: quiz.title,
        marksObtained: quiz.marksObtained,
        totalMarks: quiz.totalMarks,
      }));
      setChartData(formattedData.reverse());
    }
  }, [profile]);

  return (
    <ChartCard
      title="Academic Performance Overview"
      description="Compare your obtained scores to the full marks in your recent assessments."
    >
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Loading performance data...</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            barCategoryGap={20}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
            <XAxis
              dataKey="exam"
              className="text-sm"
              tick={{ fontSize: 12, fill: "#4B5563" }}
              axisLine={{ stroke: "#d1d5db" }}
              tickLine={false}
            />
            <YAxis
              className="text-sm"
              tick={{ fontSize: 12, fill: "#4B5563" }}
              axisLine={{ stroke: "#d1d5db" }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: 13, fontWeight: 500, color: "#374151" }}
            />
            <Bar
              dataKey="marksObtained"
              name="Your Score"
              fill="#6366f1" // Indigo-500
              radius={[6, 6, 0, 0]}
              barSize={30}
            />
            <Bar
              dataKey="totalMarks"
              name="Full Mark"
              fill="#34d399" // Emerald-400
              radius={[6, 6, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
};

export default StudentMarkProgressChart;
