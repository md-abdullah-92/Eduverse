"use client";
import React from "react";


const SocialIcon = ({ name }: { name: string }) => {
  const getIconColor = (name: string) => {
    switch (name) {
      case "facebook":
        return "from-teal-500 to-teal-600";
      case "youtube":
        return "from-red-500 to-red-600";
      case "tiktok":
        return "from-gray-800 to-black";
      case "mail":
        return "from-gray-500 to-gray-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div
      className={`p-3 rounded-xl bg-gradient-to-r ${getIconColor(
        name
      )} hover:scale-110 transition-transform duration-300 cursor-pointer shadow-lg`}
    >
      <div className="w-5 h-5 bg-white rounded-sm" />
    </div>
  );
};
export default SocialIcon;