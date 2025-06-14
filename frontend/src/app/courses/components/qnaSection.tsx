"use client";

import { useState } from "react";
import { FiMessageSquare, FiSend, FiUser } from "react-icons/fi";

interface Question {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  replies: Reply[];
}

interface Reply {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

export const QnASection = ({ courseId }: { courseId: number }) => {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 1,
      author: "John Doe",
      content: "What are the prerequisites for this course?",
      createdAt: "2023-05-15T10:30:00Z",
      replies: [
        {
          id: 1,
          author: "Course Instructor",
          content: "Basic programming knowledge is recommended.",
          createdAt: "2023-05-15T11:45:00Z",
        },
      ],
    },
    {
      id: 2,
      author: "Jane Smith",
      content: "Will there be any certification provided after completion?",
      createdAt: "2023-05-16T09:15:00Z",
      replies: [],
    },
  ]);

  const [newQuestion, setNewQuestion] = useState("");

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const question: Question = {
      id: questions.length + 1,
      author: "You",
      content: newQuestion,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    setQuestions([...questions, question]);
    setNewQuestion("");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold mb-4">Ask a Question</h3>
        <form onSubmit={handleSubmitQuestion}>
          <div className="flex gap-3">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target)}
              placeholder="Type your question here..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <FiSend className="w-4 h-4" />
              Ask
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">
          Questions ({questions.length})
        </h3>

        {questions.length === 0 ? (
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
                  <div className="bg-emerald-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiUser className="text-emerald-600 w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium">{question.author}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(question.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <p className="ml-11 mb-4">{question.content}</p>

                {question.replies.length > 0 && (
                  <div className="ml-11 pl-4 border-l-2 border-gray-200 space-y-4">
                    {question.replies.map((reply) => (
                      <div key={reply.id} className="pt-3">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                            <FiUser className="text-blue-600 w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium">{reply.author}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <p className="ml-11">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="ml-11 mt-4">
                  <button className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                    <FiMessageSquare className="w-4 h-4" />
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
