import StudyTimeBarChart from "./StudyTimeBarChart";
import StudentMarkProgressChart from "./StudentMarkProgressChart";
import type { StudentProfile } from "@/hooks/useStudentProfile";

export default function ChartGrid({ profile }: { profile: StudentProfile }) {
  return (
    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
      <StudentMarkProgressChart profile={profile} />
      <StudyTimeBarChart profile={profile} />
    </div>
  );
}
