"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { FiMessageCircle, FiCheckCircle, FiClock } from "react-icons/fi";

type Question = {
  id: string;
  title: string;
  content: string;
  courseId: number;
  isAnswered: boolean;
  createdAt: string;
  answer?: {
    content: string;
    teacherName: string;
    teacherPhotoUrl?: string;
    createdAt: string;
  };
};

export default function StudentQnAPage() {
  const { id } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // New form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [courseId, setCourseId] = useState<number>(1); // Change default as needed
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`/api/qna/students/${id}/questions`);
      setQuestions(res.data);
    } catch (error) {
      console.error("Failed to load questions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchQuestions();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setSubmitting(true);
    try {
      await axios.post("/api/qna/questions", {
        title,
        content,
        studentId: parseInt(id as string, 10),
        courseId, // adjust as necessary
      });

      setTitle("");
      setContent("");
      fetchQuestions();
    } catch (error) {
      console.error("Failed to submit question", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-100 p-6">
      <h1 className="text-2xl font-semibold mb-6 text-teal-700">
        Your Questions
      </h1>

      {/* Question Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-6 mb-8 border border-teal-100"
      >
        <h2 className="text-lg font-semibold mb-4 text-teal-600">
          Ask a New Question
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            className="w-full border rounded-md p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your question title"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            className="w-full border rounded-md p-2 h-28"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe your question in detail"
            required
          />
        </div>

        {/* Optional: Course Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course ID
          </label>
          <input
            type="number"
            className="w-full border rounded-md p-2"
            value={courseId}
            onChange={(e) => setCourseId(Number(e.target.value))}
            placeholder="Enter course ID"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Question"}
        </button>
      </form>

      {/* Questions List */}
      {loading ? (
        <div>Loading Q&A...</div>
      ) : questions.length === 0 ? (
        <p className="text-gray-500">You haven't asked any questions yet.</p>
      ) : (
        <div className="space-y-6">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-white shadow-md rounded-xl p-6 border-l-4 transition-all duration-200 ease-in-out 
              border-teal-500 hover:border-emerald-500"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-gray-800">{q.title}</h2>
                <span
                  className={`text-sm flex items-center gap-1 ${
                    q.isAnswered ? "text-green-600" : "text-yellow-500"
                  }`}
                >
                  {q.isAnswered ? (
                    <>
                      <FiCheckCircle /> Answered
                    </>
                  ) : (
                    <>
                      <FiClock /> Awaiting answer
                    </>
                  )}
                </span>
              </div>

              <p className="text-gray-700 whitespace-pre-wrap">{q.content}</p>

              {q.answer && (
                <div className="mt-4 p-4 bg-teal-50 border border-teal-100 rounded-md">
                  <p className="text-sm text-teal-800 mb-1 font-semibold flex items-center gap-2">
                    <FiMessageCircle />
                    Answer from {q.answer.teacherName}
                  </p>
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {q.answer.content}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
