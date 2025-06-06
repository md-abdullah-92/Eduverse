import { Bell, Settings } from "lucide-react";

type Props = {
  userName: string;
};

const DashboardHeader = ({ userName }: Props) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="p-4 text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Welcome back, {userName}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s what&apos;s happening with your courses today.
        </p>
      </div>
      <div className="p-4 flex items-center space-x-4">
        <button className="p-3 bg-white/70 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/90 transition-colors duration-200">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-3 bg-white/70 backdrop-blur-xl rounded-xl border border-white/20 hover:bg-white/90 transition-colors duration-200">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
