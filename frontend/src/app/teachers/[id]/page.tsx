"use client";
import {
  Award,
  BadgeCheck,
  Bell,
  BookOpen,
  Calendar,
  ChevronRight,
  ClipboardList,
  DollarSign,
  Download,
  Eye,
  Loader2,
  Play,
  Search,
  Settings,
  Star,
  TrendingUp,
  User,
  Users,
  
  
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";



type StatCardProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  trendUp?: boolean;
};

type ChartCardProps = {
  title: string;
  data?: number[];
};


type TeacherProfile = {
  user: {
    name: string;
    role: string;
    email: string;
    phone?: string;
    bio?: string;
  };
  profilePhoto: string;
  coverPhoto: string;
  rating: number;
  totalReviews: number;
  totalStudents: number;
  totalSales: number;
  totalCourses: number;
  processingOrders: number;
  completedOrders: number;
  totalOrders: number;
};





// Enhanced Stats Card
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
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  </div>
);

// Enhanced Chart Card
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

// Social Icons Component
const SocialIcon = ({ name }: { name: string }) => {
  const getIconColor = (name: string) => {
    switch (name) {
      case "facebook":
        return "from-blue-500 to-blue-600";
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

// Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100">
    <div className="text-center">
      <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
      <p className="text-gray-600 text-lg">Loading your dashboard...</p>
    </div>
  </div>
);

// Error Component
const ErrorComponent = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100">
    <div className="text-center bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-lg">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-red-600 text-2xl">⚠️</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Oops! Something went wrong
      </h2>
      <p className="text-gray-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors duration-200"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Main Dashboard Component
const ModernDashboard = () => {
  const params = useParams();
  const userId = params?.id;
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      if (!userId) {
        setError("User ID not found");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const res = await fetch(`http://localhost:5000/api/profile/${userId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(
          `Failed to fetch profile: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();

      if (!data.teacherProfile) {
        throw new Error("Teacher profile not found");
      }

      setProfile(data.teacherProfile);

      // Store data in memory (simulating localStorage)
      console.log("Storing user data:", {
        userPhoto: data.teacherProfile.profilePhoto,
        userName: data.teacherProfile.user.name || "Mentor Name",
        userId: userId,
        role: data.teacherProfile.user.role || "TEACHER",
        userEmail: data.teacherProfile.user.email || "",
        userPhone: data.teacherProfile.user.phone || "N/A",
        userBio: data.teacherProfile.user.bio || "N/A",
        userCoverPhoto: data.teacherProfile.coverPhoto || "N/A",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setError("User ID is required");
      setLoading(false);
      return;
    }

    fetchProfile();
  }, [userId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorComponent message={error} onRetry={fetchProfile} />;
  }

  if (!profile) {
    return (
      <ErrorComponent
        message="Profile data not available"
        onRetry={fetchProfile}
      />
    );
  }

  const userInfo = profile.user || {};
  const role = userInfo.role || "TEACHER";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-purple-300 to-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
      <div
        className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-r from-yellow-300 to-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-green-300 to-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
        style={{ animationDelay: "4s" }}
      />
      

        <Sidebar role={role} userId={userId} />

      <main className="flex-1 p-8 space-y-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Welcome back, {userInfo.name}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Here&apos;s what&apos;s happening with your courses today.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-3 bg-white/70 backdrop-blur-xl border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <button className="p-3 bg-white/70 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/90 transition-colors duration-200">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-3 bg-white/70 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/90 transition-colors duration-200">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Cover Photo Section */}
        <div className="relative w-full h-80 rounded-3xl overflow-hidden shadow-2xl group">
          {profile.coverPhoto && profile.coverPhoto !== "N/A" ? (
            <img
              src={profile.coverPhoto}
              alt="Cover"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-purple-600 to-teal-500" />
          )}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between">
            <div className="flex items-end space-x-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-xl">
                  {profile.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt="Profile"
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-400 to-purple-500 rounded-xl flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
              <div className="text-white pb-4">
                <h2 className="text-2xl font-bold mb-2">{userInfo.name}</h2>
                <div className="flex items-center space-x-4 text-white/90">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                      {profile.rating?.toFixed(1) || "N/A"}
                    </span>
                    <span className="text-white/70">
                      ({profile.totalReviews?.toLocaleString() || "0"} reviews)
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span>Top Instructor</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <SocialIcon name="facebook" />
              <SocialIcon name="youtube" />
              <SocialIcon name="tiktok" />
              <SocialIcon name="mail" />
              <button className="px-6 py-3 bg-white/20 backdrop-blur-md text-white font-medium rounded-xl hover:bg-white/30 transition-colors duration-200 border border-white/20">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
        {/* Sidebar */}
      
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard
            label="Total Students"
            value={profile.totalStudents?.toLocaleString() || "0"}
            icon={<Users />}
            color="text-blue-500"
            trend="+12%"
            trendUp={true}
          />
          <StatCard
            label="Total Revenue"
            value={`$${profile.totalSales?.toLocaleString() || "0"}`}
            icon={<DollarSign />}
            color="text-green-500"
            trend="+8%"
            trendUp={true}
          />
          <StatCard
            label="Active Courses"
            value={profile.totalCourses?.toString() || "0"}
            icon={<BookOpen />}
            color="text-purple-500"
            trend="+2"
            trendUp={true}
          />
          <StatCard
            label="Pending Orders"
            value={profile.processingOrders?.toString() || "0"}
            icon={<ClipboardList />}
            color="text-orange-500"
            trend="-3%"
            trendUp={false}
          />
          <StatCard
            label="Completed"
            value={profile.completedOrders?.toLocaleString() || "0"}
            icon={<BadgeCheck />}
            color="text-teal-500"
            trend="+15%"
            trendUp={true}
          />
          <StatCard
            label="Total Orders"
            value={profile.totalOrders?.toLocaleString() || "0"}
            icon={<TrendingUp />}
            color="text-teal-500"
            trend="+11%"
            trendUp={true}
          />
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          <ChartCard
            title="Student Growth"
            data={[45, 52, 68, 84, 102, 110, 125]}
          />
          <ChartCard
            title="Revenue Trend"
            data={[1200, 1900, 3000, 5000, 4200, 3800, 4500]}
          />
        </div>

        {/* Best Selling Course */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Award className="w-6 h-6 text-yellow-500" />
              <span>Best Selling Course</span>
            </h3>
            <button className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center space-x-1">
              <span>View All</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="relative w-full lg:w-80 h-52 rounded-2xl overflow-hidden shadow-lg group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-semibold">
                #1 Bestseller
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Complete Business Finance & Accounting Masterclass
                </h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center space-x-1">
                    <BookOpen size={16} />
                    <span>12 Lessons</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users size={16} />
                    <span>2,340 Students</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar size={16} />
                    <span>8 Weeks</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-2xl font-bold text-teal-600">$49.99</span>
                <span className="text-lg text-gray-400 line-through">
                  $99.99
                </span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  50% OFF
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-xl font-bold text-gray-900">2,340</div>
                  <div className="text-sm text-gray-600">Enrollments</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-xl font-bold text-green-600">
                    $116,940
                  </div>
                  <div className="text-sm text-gray-600">Revenue</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-xl font-bold text-blue-600">4.8</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="text-xl font-bold text-purple-600">92%</div>
                  <div className="text-sm text-gray-600">Completion</div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors duration-200">
                  <Eye size={16} />
                  <span>View Course</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200">
                  <Download size={16} />
                  <span>Download Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModernDashboard;