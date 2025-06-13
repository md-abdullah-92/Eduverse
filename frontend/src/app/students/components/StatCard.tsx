"use client";
import { TrendingUp } from "lucide-react";
import React from "react";

type StatCardProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  trendUp?: boolean;
};
const StatCard = ({
  label,
  value,
  icon,
  color,
  trend,
  trendUp,
}: StatCardProps) => (
  <div className="group bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20">
    <div className="flex items-center justify-between mb-4">
      <div
        className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}
      >
        <div className={`${color.replace("text-", "text-")} text-2xl`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div
          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
            trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          <TrendingUp
            size={12}
            className={trendUp ? "rotate-0" : "rotate-180"}
          />
          <span>{trend}</span>
        </div>
      )}
    </div>
    <div>
      <p className="text-2xl text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  </div>
);
export default StatCard;
