"use client";

import React, { useEffect, useState } from "react";
import { FiMessageSquare, FiSend, FiUser } from "react-icons/fi";

interface Reply {
  id: string;
  teacherName: string;
  content: string;
  teacherPhotoUrl?: string | null;
  createdAt: string;
}

interface Question {
  id: string;
  studentName: string;
  studentPhotoUrl?: string | null;
  title: string;
  content: string;
  createdAt: string;
  answer?: Reply | null;
}

interface QnASectionProps {
  courseId: number;
  // You might want to pass current student info from your auth context
  currentStudent: {
    id: number;
    name: string;
    photoUrl?: string;
  };
}

export const QnASection = ({ courseId, currentStudent }: QnASectionProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch questions on mount or courseId change
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`http://localhost:5001/api/qna/courses/${courseId}/questions`);
        if (!res.ok) throw new Error("Failed to fetch questions");
        const data: Question[] = await res.json();
        setQuestions(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [courseId]);

  // Submit a new question
  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        studentPhotoUrl: currentStudent.photoUrl || null,
        title: newQuestion, // you can split title/content in UI if needed
        content: newQuestion,
        courseId,
      };
     console.log("Submitting question:", payload);
      const res = await fetch("http://localhost:5001/api/qna/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit question");
      }

      const data = await res.json();

      // Add new question to the list
      setQuestions((prev) => [...prev, data.question]);

      // Clear input
      setNewQuestion("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-4">Ask a Question</h3>
        <form onSubmit={handleSubmitQuestion}>
          <div className="flex gap-3">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Type your question here..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              disabled={loading}
            >
              <FiSend className="w-4 h-4" />
              Ask
            </button>
          </div>
          {error && (
            <p className="text-red-600 mt-2 text-sm font-medium">{error}</p>
          )}
        </form>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">
          Questions ({questions.length})
        </h3>

        {loading && questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Loading questions...</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No questions yet. Be the first to ask!
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={question.studentPhotoUrl || "/default-user.png"}
                    alt={question.studentName}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div>
                    <div className="font-medium">{question.studentName}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(question.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <p className="ml-11 mb-4">{question.content}</p>

                {question.answer && (
                  <div className="ml-11 pl-4 border-l-2 border-gray-200 space-y-4">
                    <div className="pt-3">
                      <div className="flex items-start gap-3 mb-2">
                        <img
                          src={question.answer.teacherPhotoUrl || "/default-teacher.png"}
                          alt={question.answer.teacherName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div>
                          <div className="font-medium">{question.answer.teacherName}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(question.answer.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <p className="ml-11">{question.answer.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
