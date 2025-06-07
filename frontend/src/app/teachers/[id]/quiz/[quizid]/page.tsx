"use client";

import { useParams, useRouter } from "next/navigation";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  dmSerif,
  notoSerif,
  raleway
} from "@/utils/font"; // Ensure these fonts are correctly imported

export default function ExamDetailsPage() {
  const { quizid: id } = useParams();
  const router = useRouter();
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const { profile, loading, error } = useTeacherProfile(userId || "");

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (error || !profile) return <div className="p-6 text-red-500">Error: {error}</div>;

  const exam = profile.quizzes?.find((exam) => exam.id === id);

  if (!exam) {
    return <div className="p-6 text-red-500">Exam not found.</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-100 via-teal-50 to-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className={`${dmSerif.className} text-5xl font-bold text-teal-800`}>
            📄 {exam.title}
          </h1>
          <Button variant="outline" onClick={() => router.back()}>
            ⬅ Back
          </Button>
        </div>

        {/* Card Container */}
        <Card className="bg-white/90 backdrop-blur border shadow-lg rounded-2xl">
          <CardContent className="p-10 space-y-12">
            {/* Exam Info */}
            <div>
              <h2 className={`${dmSerif.className} text-3xl font-semibold text-teal-900 mb-3`}>
                {exam.title}
              </h2>
              <p className={`${notoSerif.className} text-gray-800 text-xl mb-2`}>
                {exam.description}
              </p>
              <p className={`${raleway.className} text-base text-gray-600`}>
                🕒 Duration: {exam.duration} minutes
              </p>
              <p className={`${raleway.className} text-sm text-gray-500`}>
                📅 Created: {new Date(exam.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Questions */}
            <div className="space-y-12">
              <h2 className={`${dmSerif.className} text-3xl text-purple-700 font-semibold`}>
                Multiple Choice & Creative Questions
              </h2>

              {exam.questions.length === 0 ? (
                <p className={`${notoSerif.className} text-lg text-gray-600`}>
                  No questions added yet.
                </p>
              ) : (
                exam.questions.map((q, index) => (
                  <div
                    key={index}
                    className="bg-white border shadow rounded-2xl p-8 space-y-6"
                  >
                    {/* Question Header */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 flex items-center justify-center text-lg font-semibold border-2 border-purple-600 text-purple-700 rounded-full">
                        {index + 1}
                      </div>
                      <div className={`${notoSerif.className} text-xl text-gray-900`}>
                        {q.question}
                      </div>
                    </div>

                    {/* MCQ Options */}
                    {q.type === "mcq" && (
                      <div className="pl-14 space-y-3 text-lg text-gray-800">
                        {q.options?.map((opt, i) => {
                          const isCorrect = opt.trim() === q.correctAnswer?.trim();
                          return (
                            <div
                              key={i}
                              className={`flex gap-2 items-start ${
                                isCorrect ? "bg-green-50 border-l-4 border-green-600 pl-2 rounded" : ""
                              }`}
                            >
                              <div className="font-semibold text-gray-700">
                                {String.fromCharCode(65 + i)}
                              </div>
                              <div>
                                {opt.includes("`") ? (
                                  <code className="bg-gray-100 px-1 rounded text-base">{opt}</code>
                                ) : (
                                  opt
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* CQ Answer */}
                    {q.type === "cq" && (
                      <div className="pl-14 text-lg text-gray-800">
                        ✍️ <span className="font-semibold">Sample Answer:</span>{" "}
                        <span className="italic">{q.correctAnswer || "N/A"}</span>
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="pl-14 text-base italic text-gray-700">
                        💡 <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}

                    {/* Difficulty */}
                    {q.difficulty && (
                      <div className="pl-14 text-sm text-gray-500">
                        Difficulty: {q.difficulty}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
