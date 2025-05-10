'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const examData = [
  { exam: 'Quiz 1', mark: 65, average: 60 },
  { exam: 'Quiz 2', mark: 70, average: 68 },
  { exam: 'Midterm', mark: 80, average: 75 },
  { exam: 'Quiz 3', mark: 75, average: 70 },
  { exam: 'Final', mark: 90, average: 78 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { exam, mark, average } = payload[0].payload;
    return (
      <div className="bg-white border border-gray-300 rounded-md p-3 shadow text-sm text-gray-800">
        <p className="font-medium">{exam}</p>
        <p>Student Mark: <span className="font-semibold">{mark}</span></p>
        <p>Class Average: <span className="font-semibold">{average}</span></p>
      </div>
    );
  }
  return null;
};

const StudentMarkProgressChart = () => {
  return (
    <section className="relative rounded-2xl overflow-hidden shadow-md">
      {/* Gradient background with two-tone carve effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0f4f8] via-white to-[#eef2ff] rounded-2xl" />

      {/* Decorative corner shapes */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[#dbeafe] rounded-br-[100%] opacity-20 z-0" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[#e0f2fe] rounded-tl-[100%] opacity-20 z-0" />

      {/* Foreground content */}
      <div className="relative p-6 space-y-4 z-10">
        <h2 className="text-xl font-bold text-gray-900">Academic Performance Overview</h2>
        <p className="text-gray-600 text-sm">
          Track your individual marks compared to the class average across assessments.
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={examData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1A5B6D" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#1A5B6D" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.2} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="exam" className="text-sm" />
              <YAxis domain={[0, 100]} className="text-sm" />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="mark"
                name="Your Mark"
                stroke="#1A5B6D"
                strokeWidth={3}
                dot={{ fill: '#1A5B6D', r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="average"
                name="Class Average"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default StudentMarkProgressChart;
