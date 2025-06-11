"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { playfair, lora } from "@/utils/font";

type Assignment = {
  title: string;
  description: string;
  createdAt: string;
};

type Review = {
  mark: number;
  suggestion: string;
};

export default function AssignmentViewPage() {
  const lessonId = useParams().lessonid as string;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<string[]>([]);
  const [reviews, setReviews] = useState<(Review | null)[]>([]);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean[]>([]);

  useEffect(() => {
    async function fetchAssignment() {
      try {
        const res = await fetch(
          `http://localhost:5001/api/assignment/lesson/${lessonId}`
        );
        const data = await res.json();
        const description = data[0]?.description || "";
        const questionList = extractNumberedQuestions(description);
        setQuestions(questionList);

        const saved = localStorage.getItem(`answers-${lessonId}`);
        const savedAnswers = saved
          ? JSON.parse(saved)
          : Array(questionList.length).fill("");

        setAnswers(savedAnswers);
        setReviews(Array(questionList.length).fill(null));
        setSubmitting(Array(questionList.length).fill(false));
        setAssignment(data[0]);
      } catch (err) {
        console.error("Failed to fetch assignment:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAssignment();
  }, [lessonId]);

  function extractNumberedQuestions(markdown: string): string[] {
    const lines = markdown.split("\n");
    const questions: string[] = [];

    for (const line of lines) {
      const match = line.match(/^\s*\d+\.\s+(.*)/);
      if (match) questions.push(match[1].trim());
    }

    return questions;
  }

  const handleAnswerChange = (index: number, value: string) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
    localStorage.setItem(`answers-${lessonId}`, JSON.stringify(updated));
  };

  const handleSubmitSingle = async (index: number) => {
    const question = questions[index];
    const answer = answers[index];
    if (!answer.trim()) {
      setStatusMsg(`Please answer question ${index + 1} before submitting.`);
      return;
    }

    const updatedSubmitting = [...submitting];
    updatedSubmitting[index] = true;
    setSubmitting(updatedSubmitting);
    setStatusMsg("");

    try {
      const res = await fetch("/api/review-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer }),
      });

      const result = await res.json();
      const updatedReviews = [...reviews];
      updatedReviews[index] = {
        mark: result.mark,
        suggestion: result.suggestion,
      };
      setReviews(updatedReviews);
      setStatusMsg(`Answer ${index + 1} evaluated.`);

      // Optional: clear localStorage if all questions reviewed
      const allReviewed = updatedReviews.every((r) => r !== null);
      if (allReviewed) {
        localStorage.removeItem(`answers-${lessonId}`);
      }
    } catch (err) {
      console.error(`Error evaluating answer ${index + 1}:`, err);
      setStatusMsg(`Failed to evaluate answer ${index + 1}.`);
    } finally {
      updatedSubmitting[index] = false;
      setSubmitting([...updatedSubmitting]);
    }
  };

  if (loading)
    return <div className="p-6 text-gray-600">Loading assignment...</div>;
  if (!assignment)
    return <div className="p-6 text-gray-600">Assignment not found.</div>;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-purple-100 ${lora.className}`}
    >
      <main className="max-w-4xl mx-auto p-6">
        <Card className="p-6 bg-white shadow-lg flex flex-col gap-6">
          <h1
            className={`text-3xl font-bold text-purple-800 ${playfair.className}`}
          >
            {assignment.title}
          </h1>
          <p className="text-sm text-gray-500">
            Created: {new Date(assignment.createdAt).toLocaleString()}
          </p>

          {questions.map((q, idx) => (
            <div key={idx} className="mb-8">
              <label className="block font-semibold text-gray-800 mb-2">
                {idx + 1}. {q}
              </label>
              <textarea
                rows={6}
                className="w-full border border-gray-300 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                placeholder={`Your answer to question ${idx + 1}`}
                value={answers[idx]}
                onChange={(e) => handleAnswerChange(idx, e.target.value)}
              />

              <button
                onClick={() => handleSubmitSingle(idx)}
                disabled={submitting[idx]}
                className="mt-2 py-1.5 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting[idx] ? "Evaluating..." : "Submit Answer"}
              </button>

              {reviews[idx] && (
                <div className="mt-3 text-sm text-gray-700 bg-purple-50 border border-purple-200 p-3 rounded-lg">
                  <p>
                    <strong>Mark:</strong> {reviews[idx]?.mark}/10
                  </p>
                  <p>
                    <strong>Suggestion:</strong>{" "}
                    {reviews[idx]?.suggestion}
                  </p>
                </div>
              )}
            </div>
          ))}

          {statusMsg && (
            <p className="text-sm text-gray-600 mt-4">{statusMsg}</p>
          )}
        </Card>
      </main>
    </div>
  );
}
