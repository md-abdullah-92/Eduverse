import { BookOpen, BadgeCheck, ClipboardList, ListChecks, History, Star } from "lucide-react";
import StatCard from "./StatCard";

export default function StatGrid({ student }: any) {
    const totalEnrolledCourses=localStorage.getItem('totalEnrolledCourses')
  return (
    <div className="p-5 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      <StatCard label="Courses Enrolled" value={`${totalEnrolledCourses|| 0}`} icon={<BookOpen />} color="text-teal-500" trend="+2" trendUp />
      <StatCard label="Certificates Earned" value={`${student.certificatesEarned || 0}`} icon={<BadgeCheck />} color="text-green-500" trend="+1" trendUp />
      <StatCard label="Lessons Completed" value={`${student.lessonsCompleted || 0}`} icon={<ClipboardList />} color="text-cyan-500" trend="+15" trendUp />
      <StatCard label="Quiz Attempts" value={`${student.quizAttempts || 0}`} icon={<ListChecks />} color="text-purple-500" trend="+3" trendUp />
      <StatCard label="Study Hours" value={`${student.studyHours || 0}`} icon={<History />} color="text-orange-500" trend="+25h" trendUp />
      <StatCard label="Reviews Given" value={`${student.reviewsGiven || 0}`} icon={<Star />} color="text-yellow-500" trend="+2" trendUp />
    </div>
  );
}
