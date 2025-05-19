'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import ChartCard from '../components/ChartCard';

const studyData = [
  { day: 'Monday', hours: 2 },
  { day: 'Tuesday', hours: 3.5 },
  { day: 'Wednesday', hours: 1.5 },
  { day: 'Thursday', hours: 4 },
  { day: 'Friday', hours: 2.5 },
  { day: 'Saturday', hours: 3 },
  { day: 'Sunday', hours: 0.5 },
];

const COLORS = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { day, hours } = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-md shadow-sm text-sm text-gray-800">
        <p className="font-medium">{day}</p>
        <p>Study Time: {hours} {hours === 1 ? 'hour' : 'hours'}</p>
      </div>
    );
  }
  return null;
};

const StudyTimeBarChart = () => {
  return (
    <ChartCard
      title="Weekly Study Time Overview"
      description="This bar graph illustrates the number of hours studied by the student each day throughout the week."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={studyData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" stroke="#374151" />
          <YAxis stroke="#374151" domain={[0, 5]} allowDecimals />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
            {studyData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default StudyTimeBarChart;
