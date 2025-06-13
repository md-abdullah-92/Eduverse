import SocialIcon from "@/components/Common-Components/SocialIcon";
import { TeacherProfile } from "@/hooks/useTeacherProfile";
import { TeacherStats } from "@/utils/types";
import { Star, User } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  profile: TeacherProfile;
  teacherStats: TeacherStats;
};

const ProfileCover = ({ profile, teacherStats }: Props) => {
  const userId = localStorage.getItem("userId");
  const userName = profile.user.name;
  const router = useRouter();

  return (
    <div className="p-5 relative w-full h-100 rounded-3xl overflow-hidden shadow-2xl group">
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
            <h2 className="text-2xl font-bold mb-2">{userName}</h2>
            <div className="flex items-center space-x-4 text-white/90">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">
                  {teacherStats?.averageRating?.toFixed(1) || "N/A"}
                </span>
                <span className="text-white/600">
                  (
                  {teacherStats?.totalRatingCoursesCount?.toLocaleString() ||
                    "0"}{" "}
                  ratings)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <SocialIcon name="facebook" />
          <SocialIcon name="youtube" />
          <SocialIcon name="tiktok" />
          <SocialIcon name="mail" />
          <button
            onClick={() => router.push(`/updatementors-profile/${userId}`)}
            className="px-6 py-3 bg-white/20 backdrop-blur-md text-white font-medium rounded-xl hover:bg-white/30 transition-colors duration-200 border border-white/20"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCover;
