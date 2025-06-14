"use client";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import React, { useState } from "react";

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  onClick: (label: string) => void;
  badge?: number;
  isActive?: boolean;
  loadingLabel?: string;
  subItems?: { label: string }[];
};

const SidebarItem = ({
  icon: Icon,
  label,
  onClick,
  badge,
  isActive,
  loadingLabel,
  subItems,
}: SidebarItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubItems = subItems && subItems.length > 0;

  const isLoading = loadingLabel === label;

  const handleClick = () => {
    if (isLoading) return;
    if (hasSubItems) {
      setIsExpanded(!isExpanded);
    } else {
      onClick(label);
    }
  };

  const handleChildClick = (childLabel: string) => {
    if (loadingLabel === childLabel) return;
    onClick(childLabel);
  };

  return (
    <div>
      <div
        className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 transform ${
          isLoading
            ? "bg-teal-50 text-teal-400 opacity-70"
            : isActive
            ? "bg-gradient-to-r from-teal-700 to-purple-600 text-white shadow-lg"
            : "hover:bg-gray-50 text-gray-700 hover:text-teal-600 hover:scale-105"
        }`}
        onClick={handleClick}
      >
        <div className="flex items-center space-x-3">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
          ) : (
            <Icon
              size={20}
              className={`transition-colors duration-300 ${
                isActive
                  ? "text-white"
                  : "text-teal-500 group-hover:text-teal-600"
              }`}
            />
          )}
          <span className="font-medium text-sm">{label}</span>
        </div>
        <div className="flex items-center space-x-2">
          {badge && (
            <span
              className={`px-2 py-1 text-xs rounded-full font-semibold ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-teal-100 text-teal-600"
              }`}
            >
              {badge}
            </span>
          )}
          {hasSubItems ? (
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

      {hasSubItems && isExpanded && (
        <div className="ml-7 mt-1 space-y-1">
          {subItems!.map((child) => {
            const childIsLoading = loadingLabel === child.label;
            return (
              <div
                key={child.label}
                className={`text-sm flex items-center gap-2 px-2 py-1 rounded-md transition-all duration-200 ${
                  childIsLoading
                    ? "text-teal-500 bg-teal-50 cursor-wait opacity-70"
                    : "text-gray-600 hover:text-teal-600 hover:underline cursor-pointer"
                }`}
                onClick={() => handleChildClick(child.label)}
              >
                {childIsLoading && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                {child.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SidebarItem;
