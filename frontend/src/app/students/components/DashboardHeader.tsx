import { Bell, Settings } from "lucide-react";
import { poppins, raleway } from "@/utils/font";

const DashboardHeader = ({ name }: { name: string }) => (
  <div className="flex justify-between items-center px-6 py-4">
    <div>
      <h1
        className={`text-4xl font-bold bg-gradient-to-r from-teal-900 to-teal-600 bg-clip-text text-transparent ${raleway.className}`}
      >
        Welcome back, {name || "Student"}!
      </h1>
      <p
        className={`mt-2 text-gray-600 italic text-base ${poppins.className}`}
      >
        Continue your learning journey and track your progress.
      </p>
    </div>
    <div className="flex items-center space-x-3">
      <button className="p-3 bg-white/70 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/90 transition duration-200">
        <Bell className="w-5 h-5 text-gray-700" />
      </button>
      <button className="p-3 bg-white/70 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/90 transition duration-200">
        <Settings className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  </div>
);

export default DashboardHeader;
