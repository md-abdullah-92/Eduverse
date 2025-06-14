"use client";

import { useEffect, useState } from "react";
import { FiUser, FiSend } from "react-icons/fi";

interface Question {
  id: string;
  studentName: string;
  studentPhotoUrl?: string | null;
  title: string;
  content: string;
  createdAt: string;
  answer?: {
    id: string;
    content: string;
    createdAt: string;
  } | null;
}

interface TeacherInfo {
  id: number;
  name: string;
  photoUrl?: string;
}

export const TeacherQnAManagement = ({
  courseId,
  teacher,
}: {
  courseId: number;
  teacher: TeacherInfo;
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/qna/courses/${courseId}/questions`);
        const data: Question[] = await res.json();
        setQuestions(data);
      } catch (err) {
        setError("Failed to load questions.");
      }
    };

    fetchQuestions();
  }, [courseId]);

  const handleSubmitAnswer = async (questionId: string) => {
    const answerText = answers[questionId]?.trim();
    if (!answerText) return;
    console.log("Submitting answer for question:", questionId, "Answer:", answerText);

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/qna/answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        
        body: JSON.stringify({
          questionId,
          teacherId: teacher.id,
          teacherName: teacher.name,
          teacherPhotoUrl: teacher.photoUrl || null,
          content: answerText,
        }),
      });

      if (!res.ok) throw new Error("Failed to post answer");

      const updated = await res.json();

      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, answer: updated.answer }
            : q
        )
      );
      setAnswers((prev) => ({ ...prev, [questionId]: "" }));
    } catch (err) {
      setError("Could not submit answer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Q&A Management</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {questions.length === 0 ? (
        <p className="text-gray-500">No questions available for this course.</p>
      ) : (
        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={q.studentPhotoUrl || "/default-user.png"}
                  alt="Student"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium">{q.studentName}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(q.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <p className="ml-11 mb-3">{q.content}</p>

              {q.answer ? (
                <div className="ml-11 border-l-2 border-gray-200 pl-4 mb-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-emerald-700">Your Answer:</span> {q.answer.content}
                  </p>
                </div>
              ) : (
                <div className="ml-11 border-l-2 border-gray-200 pl-4 mb-4">
                  <textarea
                    className="w-full border border-gray-300 rounded p-2 mb-2"
                    rows={3}
                    value={answers[q.id] || ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q.id]: e.target.value,
                      }))
                    }
                    placeholder="Write your answer..."
                  />
                  <button
                    onClick={() => handleSubmitAnswer(q.id)}
                    className="bg-emerald-600 text-white px-4 py-1 rounded hover:bg-emerald-700 flex items-center gap-2"
                    disabled={loading}
                  >
                    <FiSend className="w-4 h-4" />
                    Submit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
