"use client";

import {
  BookOpen,
  Heart,
  Star,
  ListChecks,
  User,
  History,
  BadgeCheck,
  ClipboardList,
  LogOut,
  FileText,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StudentMarkProgressChart from "@/components/StudentMarkProgressChart";
import StudyTimeBarChart from "@/components/StudyTimeBarChart";

type NavigationItem = {
  icon: React.ElementType;
  label: string;
};

type StatCardProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
};

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
};

const studentNavigationItems: NavigationItem[] = [
  
  { icon: User, label: "Update Profile" },
  { icon: BookOpen, label: "Enrolled Courses" },
  { icon: Heart, label: "Wishlist" },
  { icon: Star, label: "Reviews" },
  { icon: ListChecks, label: "Quiz Attempts" },
  { icon: FileText, label: "Assignments" },
  { icon: BadgeCheck, label: "Certificates" },
  { icon: History, label: "Order History" },
  { icon: LogOut, label: "Logout" },
];

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
  >
    <Icon size={18} className="text-yellow-500" />
    <span>{label}</span>
  </div>
);



const Sidebar: React.FC<{
  userId: string | string[];
  role: string;
  onLogout: () => void;
}> = ({ userId,  onLogout }) => {
  const router = useRouter();

  const handleClick = (label: string) => {
    switch (label) {
      case "Logout": {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("userPhoto");
          localStorage.removeItem("role");
          onLogout(); // If you have any additional logout logic
          router.push("/");
        }
        break;
      }

      case "Update Profile":
        if (userId) {
          router.push(`/updatestudents-profile/${userId}`);
        }
        break;

      default:
        console.warn(`Unhandled label: ${label}`);
        break;
    }
  };

 




  return (
    <aside className="w-72 h-full bg-white border-r px-5 py-6">
      <nav className="space-y-2">
        {studentNavigationItems.map((item, index) => (
          <SidebarItem key={index} icon={item.icon} label={item.label} onClick={() => handleClick(item.label)} />
        ))}
      </nav>
    </aside>
  );
};

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, colorClass }) => (
  <div className="bg-white p-4 rounded-xl shadow flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
    <div className={`text-2xl ${colorClass}`}>{icon}</div>
  </div>
);

const StudentDashboard: React.FC = () => {
  const params = useParams();
  const userId = params?.id;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [role, setRole] = useState("STUDENT");

  useEffect(() => {
    if (!userId) {
      setError("User ID not found");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/profile/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        if (!data.studentProfile) throw new Error("Student profile not found");

        setProfile(data.studentProfile);
        setRole(data.studentProfile?.user?.role || "STUDENT");
        localStorage.setItem("userPhoto", data.studentProfile.profilePhoto);
        localStorage.setItem("userName", data.studentProfile.user.name || "Student Name");
        localStorage.setItem("userId", data.studentProfile.userId || userId);
        localStorage.setItem("role", data.studentProfile.user.role || "STUDENT");
        localStorage.setItem("userEmail", data.studentProfile.user.email || ")");
        localStorage.setItem("userPhone", data.studentProfile.user.phone || "N/A");
        localStorage.setItem("userBio", data.studentProfile.user.bio || "N/A");
        localStorage.setItem("userCoverPhoto", data.studentProfile.coverPhoto || "N/A");
        console.log("Profile data:", data.studentProfile);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleLogout = () => {
    console.log("Logout clicked");
    // TODO: Add your logout logic here
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (error) return <div className="flex min-h-screen items-center justify-center text-red-500">{error}</div>;
  if (!profile) return null;

  const student = profile;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userId={userId} role={role} onLogout={handleLogout} />
      <main className="flex-1 p-6 space-y-6">
        {/* Cover Section */}
        <div className="relative w-full h-64 rounded-xl overflow-hidden">
          <Image
            src={student.coverPhoto || "/images/course1.png"}
            alt="Student Cover"
            fill
            className="object-cover"
          />
          <div className="absolute bottom-4 right-6">
            <button className="text-sm text-white bg-black/50 backdrop-blur px-4 py-1.5 rounded hover:bg-black/70">
              Edit Cover Photo
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="relative -mt-20 pl-6 flex items-end gap-6">
          <Image
            src={student.profilePhoto || "/images/team/apurbo.png"}
            alt="Student Profile"
            width={160}
            height={160}
            className="rounded-full border-4 border-white shadow-lg"
          />
          <div className="flex-1 flex justify-between items-center pr-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{student.user.name || "Student Name"}</h2>
              <p className="text-sm text-gray-500">Student ID: {student.studentId || profile.id}</p>
            </div>
            <span className="text-sm text-gray-600">📘 Active Learner</span>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <StatCard label="Courses Enrolled" value={student.coursesEnrolled?.toString() || "-"} icon={<BookOpen />} colorClass="text-blue-500" />
          <StatCard label="Certificates Earned" value={student.certificatesEarned?.toString() || "-"} icon={<BadgeCheck />} colorClass="text-green-500" />
          <StatCard label="Lessons Completed" value={student.lessonsCompleted?.toString() || "-"} icon={<ClipboardList />} colorClass="text-cyan-500" />
          <StatCard label="Quiz Attempts" value={student.quizAttempts?.toString() || "-"} icon={<ListChecks />} colorClass="text-purple-500" />
          <StatCard label="Orders Placed" value={student.ordersPlaced?.toString() || "-"} icon={<History />} colorClass="text-orange-500" />
          <StatCard label="Reviews Given" value={student.reviewsGiven?.toString() || "-"} icon={<Star />} colorClass="text-yellow-500" />
        </div>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StudyTimeBarChart />
      <StudentMarkProgressChart />
    </div>


        {/* Recent Courses */}
        <div className="bg-white rounded-xl p-6 shadow space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Courses</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex items-center space-x-4">
                <Image
                  src={`/images/course${index}.png`}
                  alt={`Course ${index}`}
                  width={100}
                  height={60}
                  className="rounded-md"
                />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-gray-800">Course Title {index}</h4>
                  <p className="text-xs text-gray-500">Progress: {40 + index * 10}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
