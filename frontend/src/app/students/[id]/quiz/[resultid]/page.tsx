"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  dmSerif,
  notoSerif,
  raleway,
} from "@/utils/font";
import ChatWidget from "@/app/lesson/ChatWidget";

type AnsweredQuestion = {
  id: string | number;
  question: string;
  correctAnswer?: string;
  useranswer?: string;
  userAnswer?: string;
  options?: string[];
  explanation?: string;
  difficulty?: string;
  type?: string;
};

type QuizResult = {
  id: number;
  title: string;
  studentId: number;
  courseId: number;
  lessonId: number;
  marks: number;
  createdAt: string;
  answeredquestions: AnsweredQuestion[];
};



export default function QuizResultDetails() {
  const { resultid } = useParams();
  const quizResultId =
    typeof resultid === "string"
      ? resultid
      : Array.isArray(resultid)
      ? resultid[0]
      : "";

  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizResultId) return;

    const controller = new AbortController();

    async function fetchQuizResult() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `http://localhost:5000/api/result/${encodeURIComponent(quizResultId)}`,
          { cache: "no-store", signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(response.status === 404 ? "Quiz result not found." : "Failed to load quiz result.");
        }

        const result: QuizResult = await response.json();
        setQuizResult({
          ...result,
          answeredquestions: result.answeredquestions ?? [],
        });
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(fetchError instanceof Error ? fetchError.message : "Failed to load quiz result.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchQuizResult();
    return () => controller.abort();
  }, [quizResultId]);

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (error || !quizResult)
    return <div className="p-6 text-red-500">{error || "Quiz result not found."}</div>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-50 via-white to-teal-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className={`${dmSerif.className} text-5xl font-bold text-purple-800`}>
            🎓 {quizResult.title}
          </h1>
          <Button variant="outline" onClick={() => history.back()}>
            ⬅ Back
          </Button>
        </div>

        {/* Result Info Card */}
        <Card className="bg-white/90 backdrop-blur border shadow-lg rounded-2xl mb-10">
          <CardContent className="p-10 space-y-5">
            <p className={`${notoSerif.className} text-xl text-gray-800`}>
              <strong>Student ID:</strong> {quizResult.studentId}
            </p>
            <p className={`${notoSerif.className} text-xl text-gray-800`}>
              <strong>Course ID:</strong> {quizResult.courseId}
            </p>
            <p className={`${notoSerif.className} text-xl text-gray-800`}>
              <strong>Lesson ID:</strong> {quizResult.lessonId}
            </p>
            <p className={`${raleway.className} text-lg text-gray-700`}>
              🏆 <strong>Marks:</strong> {quizResult.marks}
            </p>
            <p className={`${raleway.className} text-sm text-gray-500`}>
              📅 <strong>Submitted:</strong>{" "}
              {new Date(quizResult.createdAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Questions */}
        <ScrollArea className="max-h-[70vh] pr-2">
          <div className="space-y-10">
            {(quizResult.answeredquestions || []).map((q, idx) => (
              <Card
                key={q.id}
                className="bg-white border shadow rounded-2xl p-8 space-y-6"
              >
                {/* Question Header */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 flex items-center justify-center text-lg font-semibold border-2 border-purple-600 text-purple-700 rounded-full">
                    {idx + 1}
                  </div>
                  <div className={`${notoSerif.className} text-xl text-gray-900`}>
                    {q.question}
                  </div>
                </div>

                {/* Options (if MCQ) */}
                {(q.options ?? []).length > 0 && (
                  <div className="pl-14 space-y-3 text-lg text-gray-800">
                    {(q.options ?? []).map((opt: string, i: number) => {
                      const isCorrect = opt.trim() === q.correctAnswer?.trim();
                      const userSelected = q.useranswer ?? q.userAnswer ?? "";
                      const isUserAnswer = opt.trim() === userSelected.trim();
                      return (
                        <div
                          key={i}
                          className={`flex gap-2 items-start ${
                            isCorrect
                              ? "bg-green-50 border-l-4 border-green-600 pl-2 rounded"
                              : isUserAnswer
                              ? "bg-yellow-50 border-l-4 border-yellow-500 pl-2 rounded"
                              : ""
                          }`}
                        >
                          <div className="font-semibold text-gray-700">
                            {String.fromCharCode(65 + i)}
                          </div>
                          <div>{opt}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* User Answer */}
                {(q.useranswer ?? q.userAnswer) && (
                  <div className="pl-14 text-lg">
                    🧠 <strong>Your Answer:</strong>{" "}
                    <span className="text-purple-700">{q.useranswer ?? q.userAnswer}</span>
                  </div>
                )}

                {/* Correct Answer */}
                {q.correctAnswer && (
                  <div className="pl-14 text-lg text-green-700">
                    ✅ <strong>Correct Answer:</strong> {q.correctAnswer}
                  </div>
                )}

                {/* Explanation */}
                {q.explanation && (
                  <div className="pl-14 text-base italic text-gray-700">
                    💡 <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}

                {/* Meta Info */}
                <div className="pl-14 text-sm text-gray-500">
                  Difficulty: {q.difficulty} | Type: {q.type}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
        <ChatWidget/>
      </div>
    </div>
  );
}
