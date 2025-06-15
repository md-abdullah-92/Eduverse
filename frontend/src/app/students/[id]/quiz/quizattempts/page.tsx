"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

import Sidebar from "@/components/Common-Components/Sidebar";
import { playfair, lora } from "@/utils/font";
import { useStudentProfile } from "@/hooks/useStudentProfile";

type quizResults = {
  id: number;
  lessonId: string;
  courseId: string;
  title: string;
  studentId: string;
  marks: number;
  answeredQuestions: AnsweredQuestion[];
  createdAt: string;
};

type AnsweredQuestion = {
  id: string;
  question: string;
  correctAnswer?: string;
  userAnswer?: string;
  options?: string[];
  explanation?: string;
  difficulty: string;
  type: string;
  quizId?: string;
  quizResultId: string;
};

export default function SavedQuizResults() {
  const router = useRouter();
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") || "12345" : "12345";
  const { profile, loading, error } = useStudentProfile(userId);

  const [quizResults, setQuizResults] = useState<quizResults[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingQuizId, setLoadingQuizId] = useState<number | null>(null);

  useEffect(() => {
    if (profile?.quizResults) {
      setQuizResults(profile.quizResults);
    }
  }, [profile?.quizResults]);

  const handleView = (id: number) => {
    setLoadingQuizId(id);
    router.push(`/students/${userId}/quiz/${id}`);
  };

  const filteredQuizResults = quizResults.filter((q) =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-purple-100 relative">
      <aside className="w-64 bg-white shadow-md p-4">
        <Sidebar role="STUDENT" userId={userId} />
      </aside>

      <main className={`flex-1 p-5 ml-20 ${lora.className}`}>
        <h1 className={`text-3xl font-bold text-purple-800 mb-6 ${playfair.className}`}>
          Saved Quiz Results
        </h1>

        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search by quiz title..."
            className={`w-full max-w-md border-purple-300 shadow-sm focus:ring-2 focus:ring-purple-300 ${lora.className}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-gray-600">Loading quiz results...</p>
        ) : error ? (
          <p className="text-red-500">Failed to load quiz results.</p>
        ) : filteredQuizResults.length === 0 ? (
          <p className="text-gray-600">No matching quiz results found.</p>
        ) : (
          <ScrollArea className="pr-2">
            <div className="space-y-6">
              {filteredQuizResults.map((quiz) => (
                <Card
                  key={quiz.id}
                  className={`p-8 border border-purple-200 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200 ${lora.className}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <h2 className={`text-xl font-bold text-purple-800 ${playfair.className}`}>
                        {quiz.title}
                      </h2>
                      <p className="text-sm text-gray-600">
                        <strong>Marks:</strong> {quiz.marks}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Course ID:</strong> {quiz.courseId}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Lesson ID:</strong> {quiz.lessonId}
                      </p>
                      <p className="text-xs text-gray-500">
                        <strong>Created:</strong>{" "}
                        {quiz.createdAt ? new Date(quiz.createdAt).toLocaleString() : "Unknown"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="text-purple-700 border-purple-300 hover:bg-purple-100 flex items-center gap-2"
                          onClick={() => handleView(quiz.id)}
                          disabled={loadingQuizId === quiz.id}
                        >
                          {loadingQuizId === quiz.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading
                            </>
                          ) : (
                            "View"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </main>
    </div>
  );
}
