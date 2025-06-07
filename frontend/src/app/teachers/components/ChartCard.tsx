'use client';
import React from 'react';


type ChartCardProps = {
  title: string;
  data?: number[];
};



const ChartCard = ({
  title,
  data = [65, 59, 80, 81, 56, 55, 40],
}: ChartCardProps) => {
  const maxValue = Math.max(...data);

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-lg font-bold text-gray-900">{title}</h4>
        <select className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option>This week</option>
          <option>This month</option>
          <option>This year</option>
        </select>
      </div>

      {/* Simple Bar Chart */}
      <div className="flex items-end justify-between h-32 space-x-2">
        {data.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-gradient-to-t from-teal-500 to-purple-500 rounded-t-lg transition-all duration-1000 ease-out"
              style={{
                height: `${(value / maxValue) * 100}%`,
                animationDelay: `${index * 100}ms`,
              }}
            />
            <span className="text-xs text-gray-500 mt-2">{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartCard;