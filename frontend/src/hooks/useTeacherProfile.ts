import { useEffect, useState, useCallback } from "react";

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
  quizzes?: {
    id: string;
    title: string;
    description: string;
    duration: number;
    createdAt: string;
    questions: {
      question: string;
      options: string[];
      correctAnswer: string;
      explanation?: string;
      type: "mcq" | "cq"; // mcq for multiple choice, cq for constructed response
      difficulty?: "easy" | "medium" | "hard"; // optional difficulty level
    }[];
  }[];
  assignments?: {
    id: number;
    title: string;
    description: string;
  }[];
};

export const useTeacherProfile = (userId: string | number | undefined) => {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
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
        throw new Error(`Failed to fetch profile: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      if (!data.teacherProfile) {
        throw new Error("Teacher profile not found");
      }

      setProfile(data.teacherProfile);

      // LocalStorage setup
      localStorage.setItem("userId", userId.toString());
      localStorage.setItem("role", data.teacherProfile.user.role || "TEACHER");
      localStorage.setItem("userPhoto", data.teacherProfile.profilePhoto || "");
      localStorage.setItem("userName", data.teacherProfile.user.name || "Mentor Name");
      localStorage.setItem("userEmail", data.teacherProfile.user.email || "");
      localStorage.setItem("userPhone", data.teacherProfile.user.phone || "N/A");
      localStorage.setItem("userBio", data.teacherProfile.user.bio || "N/A");
      localStorage.setItem("userCoverPhoto", data.teacherProfile.coverPhoto || "N/A");

    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
};
