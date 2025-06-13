import { Award, BookOpen, User } from "lucide-react";
import SocialIcon from "../../../components/Common-Components/SocialIcon";

export default function ProfileCard({ student, userInfo }: any) {
  return (
    <div className="p-5 relative w-full h-100 rounded-3xl overflow-hidden shadow-2xl group">
      {student.coverPhoto && student.coverPhoto !== "N/A" ? (
        <img
          src={student.coverPhoto}
          alt="Cover"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-purple-600 to-cyan-500" />
      )}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between">
        <div className="flex items-end space-x-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-xl overflow-hidden">
              {student.profilePhoto ? (
                <img
                  src={student.profilePhoto}
                  alt={userInfo.name || "Profile"}
                  className="w-full h-full object-cover rounded-xl"
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
          <div className="text-white pb-4 font-[${Poppins.style.fontFamily}]">
            <h2 className="text-3xl mb-2">{userInfo.name || "Student"}</h2>
            <div className="flex items-center space-x-4 text-white/90">
              {/* <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">
                  {student.averageScore || 0}% Avg Score
                </span>
              </div> */}
              <div className="flex items-center space-x-1">
                <Award className="w-4 h-4" />
                <span>Active Learner</span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>Student ID: {userInfo.id || "N/A"}</span>
              </div>
            </div>
            {userInfo.bio && userInfo.bio !== "N/A" && (
              <p className="text-white/80 text-base mt-2 max-w-md">
                {userInfo.bio}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <SocialIcon name="facebook" />
          <SocialIcon name="youtube" />
          <SocialIcon name="tiktok" />
          <SocialIcon name="mail" />
        </div>
      </div>
    </div>
  );
}
