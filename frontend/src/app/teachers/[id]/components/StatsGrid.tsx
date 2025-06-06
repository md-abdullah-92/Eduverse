import React from "react";

interface StatsGridProps {
  profile: any; // You can replace `any` with a proper type if available
}

const StatsGrid: React.FC<StatsGridProps> = ({ profile }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      <div className="bg-white p-4 rounded-2xl shadow">
        <h4 className="text-gray-600">Total Courses</h4>
        <p className="text-2xl font-semibold">{profile?.courses?.length || 0}</p>
      </div>
      <div className="bg-white p-4 rounded-2xl shadow">
        <h4 className="text-gray-600">Total Students</h4>
        <p className="text-2xl font-semibold">{profile?.studentsEnrolled || 0}</p>
      </div>
      <div className="bg-white p-4 rounded-2xl shadow">
        <h4 className="text-gray-600">Rating</h4>
        <p className="text-2xl font-semibold">{profile?.averageRating?.toFixed(1) || "N/A"}</p>
      </div>
    </div>
  );
};

export default StatsGrid;
