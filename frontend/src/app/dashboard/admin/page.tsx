'use client';

export default function AdminDashboard() {
  // This would come from your API/database
  const stats = {
    totalUsers: 1250,
    totalCourses: 45,
    activeStudents: 890,
    totalInstructors: 32
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-semibold text-sky-900">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Courses</h3>
          <p className="text-2xl font-semibold text-sky-900">{stats.totalCourses}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Students</h3>
          <p className="text-2xl font-semibold text-sky-900">{stats.activeStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Instructors</h3>
          <p className="text-2xl font-semibold text-sky-900">{stats.totalInstructors}</p>
        </div>
      </div>
    </div>
  );
}
