"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { playfair, lora } from "@/utils/font";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

// Type definition for Assignment
type Assignment = {
  title: string;
  description: string;
  createdAt: string;
};

export default function AssignmentViewPage() {
  const lessonId = useParams().lessonid as string;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>("");
  const [mark, setMark] = useState<number | null>(null);

  useEffect(() => {
    async function fetchAssignment() {
      try {
        const res = await fetch(
          `http://localhost:5001/api/assignment/lesson/${lessonId}`
        );
        const data = await res.json();
        setAssignment(data[0]);
      } catch (err) {
        console.error("Failed to fetch assignment:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAssignment();
  }, [lessonId]);

  async function handleSubmit() {
    if (!answer.trim()) {
      setStatusMsg("Answer cannot be empty.");
      return;
    }

    setSaving(true);
    setStatusMsg("");

    try {
      // Send assignment and answer to Gemini AI for review and marking
      const res = await fetch("/api/review-assignment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId,
          title: assignment?.title,
          description: assignment?.description,
          answer,
        }),
      });

      if (!res.ok) throw new Error("Failed to send to Gemini AI");

      const result = await res.json();
      setStatusMsg("Answer submitted and reviewed successfully! ✅");
      setMark(result.mark);
      setAnswer("");
    } catch (err) {
      console.error(err);
      setStatusMsg("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return <div className="p-6 text-gray-600">Loading assignment...</div>;
  if (!assignment)
    return <div className="p-6 text-gray-600">Assignment not found.</div>;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-purple-100 ${lora.className}`}
    >
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
        {/* Assignment Column */}
        <Card className="p-6 shadow-lg bg-white flex flex-col max-h-[90vh]">
          <h1
            className={`text-3xl font-bold text-purple-800 mb-4 ${playfair.className}`}
          >
            {assignment.title}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Created: {new Date(assignment.createdAt).toLocaleString()}
          </p>

          <ScrollArea className="flex-1 overflow-auto px-4 py-2">
            <div className={`prose prose-yellow max-w-none ${lora.className}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: (props) => (
                    <h1
                      className={`text-3xl font-bold mt-4 mb-3 text-yellow-800 ${playfair.className}`}
                      {...props}
                    />
                  ),
                  h2: (props) => (
                    <h2
                      className={`text-2xl font-bold mt-3 mb-2 text-yellow-700 ${playfair.className}`}
                      {...props}
                    />
                  ),
                  h3: (props) => (
                    <h3
                      className={`text-xl font-semibold mt-3 mb-2 text-yellow-600 ${playfair.className}`}
                      {...props}
                    />
                  ),
                  p: (props) => (
                    <p className="text-gray-700 mb-3 leading-relaxed" {...props} />
                  ),
                  ul: (props) => (
                    <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />
                  ),
                  ol: (props) => (
                    <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />
                  ),
                  li: (props) => <li className="text-gray-700 mb-1" {...props} />,
                  strong: (props) => (
                    <strong className="font-bold text-yellow-600" {...props} />
                  ),
                  em: (props) => <em className="italic" {...props} />,
                  del: (props) => <del className="line-through" {...props} />,
                  code({ inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={oneLight}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-md my-3"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  blockquote: (props) => (
                    <blockquote
                      className="border-l-4 border-yellow-300 pl-3 italic text-gray-600 my-3"
                      {...props}
                    />
                  ),
                }}
              >
                {assignment.description}
              </ReactMarkdown>
            </div>
          </ScrollArea>
        </Card>

        {/* Answer Column */}
        <Card className="p-6 shadow-lg bg-white flex flex-col max-h-[90vh]">
          <h2
            className={`text-2xl font-bold text-purple-800 mb-4 ${playfair.className}`}
          >
            Your Answer
          </h2>

          <textarea
            className="flex-1 w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your answer here..."
          />

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="mt-4 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? "Submitting..." : "Submit Answer"}
          </button>

          {statusMsg && <p className="text-sm text-gray-600 mt-2">{statusMsg}</p>}
          {mark !== null && (
            <p className="text-lg text-green-600 font-semibold mt-2">Mark: {mark}/100</p>
          )}
        </Card>
      </main>
    </div>
  );
}
