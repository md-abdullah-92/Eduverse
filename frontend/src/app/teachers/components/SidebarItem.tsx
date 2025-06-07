"use client";
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  onClick: (label: string) => void;
  badge?: number;
  isActive?: boolean;
  children?: { label: string }[];
};

const SidebarItem = ({
  icon: Icon,
  label,
  onClick,
  badge,
  isActive,
  children = [],
}: SidebarItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else {
      onClick(label);
    }
  };

  const handleChildClick = (childLabel: string) => {
    onClick(childLabel);
  };

  return (
    <div>
      <div
        className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
          isActive
            ? "bg-gradient-to-r from-teal-700 to-purple-600 text-white shadow-lg"
            : "hover:bg-gray-50 text-gray-700 hover:text-teal-600"
        }`}
        onClick={handleClick}
      >
        <div className="flex items-center space-x-3">
          <Icon
            size={20}
            className={`transition-colors duration-300 ${
              isActive
                ? "text-white"
                : "text-teal-500 group-hover:text-teal-600"
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
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )
          ) : (
            <ChevronRight
              size={14}
              className={`transition-all duration-300 ${
                isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
              }`}
            />
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-7 mt-1 space-y-1">
          {children.map((child) => (
            <div
              key={child.label}
              className="text-sm text-gray-600 hover:text-teal-600 hover:underline cursor-pointer px-2 py-1 rounded-md transition-all duration-200"
              onClick={() => handleChildClick(child.label)}
            >
              {child.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarItem;
