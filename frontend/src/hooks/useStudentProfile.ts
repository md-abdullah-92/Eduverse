import { API_URLS } from "@/lib/api/urls";
import { useEffect, useState } from "react";
const USER_API_URL =
  process.env.NEXT_PUBLIC_USER_API_URL || `${API_URLS.user}`;

type AnsweredQuestion = {
  id: string;
  question: string;
  correctAnswer?: string;
  useranswer?: string;
  userAnswer?: string;
  options?: string[];
  explanation?: string;
  difficulty: string;
  type: string;
  quizId?: string;
  quizResultId: string;
};

export type StudentProfile = {
  user: {
    name: string;
    role: string;
    email: string;
    phone?: string;
    bio?: string;
  };
  profilePhoto: string;
  coverPhoto: string;
  userId: string;
  quizResults?: {
    id: number;
    lessonId: string;
    courseId: string;
    title: string;
    studentId: string;
    fullmark: number;
    marks: number;
    answeredquestions?: AnsweredQuestion[];
    answeredQuestions?: AnsweredQuestion[];
    createdAt: string;
  }[];
};

export function useStudentProfile(userId: string | null) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [role, setRole] = useState<string>("STUDENT");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("User ID not found");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${USER_API_URL}/profile/${userId}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch profile");
        const data: { studentProfile?: StudentProfile } = await res.json();

        if (!data.studentProfile) throw new Error("Student profile not found");

        const normalizedProfile = {
          ...data.studentProfile,
          quizResults: (data.studentProfile.quizResults || []).map((result) => {
            const answeredquestions = result.answeredquestions ?? result.answeredQuestions ?? [];
            return {
              ...result,
              answeredquestions,
              answeredQuestions: answeredquestions,
            };
          }),
        };

        setProfile(normalizedProfile);
        setRole(data.studentProfile?.user?.role || "STUDENT");

        if (typeof window !== "undefined") {
          localStorage.setItem("userPhoto", data.studentProfile.profilePhoto || "");
          localStorage.setItem("userName", data.studentProfile.user.name || "Student Name");
          localStorage.setItem("userId", data.studentProfile.userId || userId);
          localStorage.setItem("role", data.studentProfile.user.role || "STUDENT");
          localStorage.setItem("userEmail", data.studentProfile.user.email || "");
          localStorage.setItem("userPhone", data.studentProfile.user.phone || "N/A");
          localStorage.setItem("userBio", data.studentProfile.user.bio || "N/A");
          localStorage.setItem("userCoverPhoto", data.studentProfile.coverPhoto || "N/A");
        }

        console.log("Profile data:", data.studentProfile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);
  

  return { profile, role, loading, error };
}
