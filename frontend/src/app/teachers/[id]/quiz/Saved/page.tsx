"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sidebar from "../../../components/Sidebar";
import { robotoSlab } from "@/utils/font";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";

export default function PublishedQuiz() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (uid) setUserId(uid);
  }, []);

  const { profile, loading, error, refetch } = useTeacherProfile(userId ?? undefined);

  type Quiz = {
    id: string;
    title: string;
    description: string;
    duration: number;
    createdAt: string;
    questions: {
      question: string;
      options: string[];
      correctAnswer: string;
    }[];
  };

  const quizzes: Quiz[] = profile?.quizzes ?? [];
  console.log("Quizzes:", quizzes);

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to delete this exam?");
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:5000/api/quiz/delete/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (res.ok) {
        toast.success("Exam deleted successfully!");
        refetch();
      } else {
        toast.error(result.message || "Failed to delete exam");
      }
    } catch (error) {
      toast.error("Error deleting exam");
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/teachers/${userId}/quiz/${id}`);
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <p className="text-xl text-gray-600">No user ID found. Please log in.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <p className="text-xl text-gray-600">Loading profile and exams...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <p className="text-xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100">
      <aside className="w-64 bg-white shadow-md p-4">
        <Sidebar role="TEACHER" userId={userId} />
      </aside>

      <main className="ml-20 p-6 flex-1">
        <div className={`${robotoSlab.className} text-gray-800 max-w-5xl mx-auto`}>
          <h1 className="text-4xl font-bold mb-8 text-teal-700">📋 Published Exams</h1>

          {quizzes.length === 0 ? (
            <p className="text-lg text-gray-600">No exams published yet.</p>
          ) : (
            quizzes.map((exam) => (
              <Card
                key={exam.id}
                className="mb-6 border border-teal-200 shadow-lg bg-white/70 backdrop-blur-md rounded-2xl transition hover:shadow-xl"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-teal-800">{exam.title}</h2>
                      <p className="text-base text-gray-700 mt-1">{exam.description}</p>
                    </div>
                    <span className="text-sm text-gray-500 mt-1">
                      📅 {new Date(exam.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-md mb-4 text-gray-700">
                    ⏱ <span className="font-medium">Duration:</span> {exam.duration} min &nbsp;|&nbsp;
                    📄 <span className="font-medium">Questions:</span> {exam.questions.length}
                  </p>

                  <div className="flex gap-4 mt-4">
                    <Button
                      onClick={() => handleViewDetails(exam.id)}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-base px-6"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(exam.id)}
                      className="text-base px-6"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
