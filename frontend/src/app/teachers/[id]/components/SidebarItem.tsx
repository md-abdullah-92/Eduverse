"use client";
import { ChevronRight } from "lucide-react";
import React from "react";


type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  badge?: number;
  isActive?: boolean;
};

const SidebarItem = ({
  icon: Icon,
  label,
  onClick,
  badge,
  isActive,
}: SidebarItemProps) => (
  <div
    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
      isActive
        ? "bg-gradient-to-r from-teal-700 to-purple-600 text-white shadow-lg"
        : "hover:bg-gray-50 text-gray-700 hover:text-teal-600"
    }`}
    onClick={onClick}
  >
    <div className="flex items-center space-x-3">
      <Icon
        size={20}
        className={`transition-colors duration-300 ${
          isActive ? "text-white" : "text-teal-500 group-hover:text-teal-600"
        }`}
      />
      <span className="font-medium text-sm">{label}</span>
    </div>
    <div className="flex items-center space-x-2">
      {badge && (
        <span
          className={`px-2 py-1 text-xs rounded-full font-semibold ${
            isActive ? "bg-white/20 text-white" : "bg-teal-100 text-teal-600"
          }`}
        >
          {badge}
        </span>
      )}
      <ChevronRight
        size={14}
        className={`transition-all duration-300 ${
          isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
        }`}
      />
    </div>
  </div>
);

export default SidebarItem;
