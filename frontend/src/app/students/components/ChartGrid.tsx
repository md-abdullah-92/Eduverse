import StudyTimeBarChart from "./StudyTimeBarChart";
import StudentMarkProgressChart from "./StudentMarkProgressChart";

export default function ChartGrid() {
  return (
    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <StudentMarkProgressChart />
      <StudyTimeBarChart />
    </div>
  );
}
