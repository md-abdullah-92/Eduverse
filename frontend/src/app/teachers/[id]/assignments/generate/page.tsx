"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaTasks } from "react-icons/fa";
import { FiFileText } from "react-icons/fi";
import { Type, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { merriweather } from "@/utils/font";
import SaveSlideButton from "@/app/teachers/components/PrintButton";
import Sidebar from "../../../../../components/Common-Components/Sidebar";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

type Question = {
  number: number;
  text: string;
};

export default function GenerateShortQuestionPage() {
  const [selectedTitle, setSelectedTitle] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("userId") || "12345"
      : "12345";

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLoading) {
      setTimer(60);
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerateShortQuestions = async () => {
    if (!pdfFile) return alert("Please upload a PDF file!");

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);

      const res = await fetch("http://localhost:8000/short-questions/", {
        method: "POST",
        body: formData,
      });

      const markdownText = await res.text();
      setMarkdown(markdownText);

      const parsedQuestions = [
        ...markdownText.matchAll(/^\s*(\d+)\.\s+(.*)$/gm),
      ].map(([, number, text]) => ({
        number: parseInt(number),
        text: text.trim(),
      }));

      setQuestions(parsedQuestions);
      setShowEditor(true);
    } catch (err) {
      console.error("Short question generation failed:", err);
      alert("Failed to generate questions.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const saveShortQuestion = async (title: string, content: string) => {
    if (!title || !content) {
      alert("Please provide a title and content.");
      return;
    }

    if (!userId || userId === "12345") {
      alert("Invalid or missing teacher ID.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: content,
          teacherId: parseInt(userId),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`Error: ${data.error}`);
        return;
      }

      alert("Short questions saved successfully!");
      setMarkdown("");
      setSelectedTitle("");
      setShowEditor(false);
      setQuestions([]);
    } catch (err) {
      console.error("Failed to save:", err);
      alert("Failed to save. Please try again.");
    }
  };

  const generateMarkdownFromQuestions = () =>
    questions.map((q, idx) => `${idx + 1}. ${q.text}`).join("\n");

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100">
      <aside className="w-64 bg-white shadow-md p-4">
        <Sidebar role="TEACHER" userId={userId} />
      </aside>

      <main className="ml-20 p-5 flex-1">
        <div
          className={`min-h-screen bg-gradient-to-br from-teal-50 to-white px-6 pb-10 ${merriweather.className}`}
        >
          <header className="mb-6 pt-8">
            <h1 className="text-4xl font-bold text-teal-700 flex items-center gap-3">
              <FaTasks />
              Generate Short Questions
            </h1>
            <p className="text-gray-600 mt-2 text-base">
              Create short questions from uploaded PDF content automatically.
            </p>
          </header>

          {/* PDF Upload */}
          <div className="mt-4 space-y-2 w-full md:w-[400px]">
            <Label className="flex items-center gap-2 text-[#C084FC] font-semibold">
              <FiFileText />
              Upload PDF
            </Label>
            <Input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setPdfFile(e.target.files[0]);
                }
              }}
            />
            <Button
              onClick={handleGenerateShortQuestions}
              disabled={isLoading}
              className="mt-4 bg-teal-600 hover:bg-yellow-700 text-white flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4" />
                  Generating... ({timer}s)
                </>
              ) : (
                "Generate Short Questions"
              )}
            </Button>
          </div>

          {showEditor && (
            <>
              <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mt-10 mb-6">
                <div className="w-full md:w-auto flex items-center gap-2 bg-white border border-yellow-300 rounded-lg shadow-sm px-4 py-2">
                  <Type className="text-yellow-600 w-5 h-5" />
                  <Input
                    className="border-none focus-visible:ring-0 text-lg placeholder:text-gray-400"
                    placeholder="Title..."
                    value={selectedTitle}
                    onChange={(e) => setSelectedTitle(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="outline"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    {showPreview ? (
                      <EyeOff className="mr-2 w-4 h-4" />
                    ) : (
                      <Eye className="mr-2 w-4 h-4" />
                    )}
                    {showPreview ? "Hide Preview" : "Show Preview"}
                  </Button>

                  <SaveSlideButton title={selectedTitle} />

                  <Button
                    onClick={() => {
                      setMarkdown("");
                      setQuestions([]);
                    }}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Clear Editor
                  </Button>

                  <Button
                    onClick={() =>
                      saveShortQuestion(
                        selectedTitle,
                        generateMarkdownFromQuestions()
                      )
                    }
                    className="bg-teal-800 hover:bg-teal-500 text-white"
                  >
                    Save
                  </Button>
                </div>
              </div>

              <div
                className={`flex-1 grid ${
                  showPreview ? "md:grid-cols-2" : "grid-cols-1"
                } gap-6`}
              >
                {/* Markdown Editor */}
                <Card className="h-[calc(100vh-300px)] bg-white border border-yellow-200">
                  <div className="p-4 border-b border-yellow-100">
                    <h2 className="text-lg font-semibold text-yellow-700">
                      Short Question Editor
                    </h2>
                  </div>
                  <ScrollArea className="flex-1 overflow-auto px-4 py-2">
                    <SimpleMDE
                      value={generateMarkdownFromQuestions()}
                      onChange={(val) => setMarkdown(val)}
                      options={{
                        spellChecker: false,
                        minHeight: "100%",
                        autofocus: true,
                        toolbar: [
                          "bold",
                          "italic",
                          "heading",
                          "|",
                          "quote",
                          "unordered-list",
                          "ordered-list",
                          "|",
                          "link",
                          "preview",
                        ],
                      }}
                    />
                  </ScrollArea>
                </Card>

                {/* Preview */}
                {showPreview && (
                  <Card className="h-[calc(100vh-300px)] bg-white border border-yellow-200">
                    <div className="p-4 border-b border-yellow-100">
                      <h2 className="text-lg font-semibold text-yellow-700">
                        Preview
                      </h2>
                    </div>
                    <ScrollArea className="flex-1 overflow-auto px-4 py-2">
                      <h2 className="text-2xl font-bold text-yellow-700 mb-4">
                        {selectedTitle}
                      </h2>
                      <ol className="list-none space-y-3 ml-2">
                        {questions.map((q, idx) => (
                          <li
                            key={idx}
                            className="flex items-start justify-between gap-3 group"
                          >
                            <span className="flex-1 leading-relaxed">
                              <strong>{idx + 1}.</strong> {q.text}
                            </span>
                            <button
                              onClick={() => removeQuestion(idx)}
                              className="text-red-500 hover:text-red-700 invisible group-hover:visible"
                              title="Delete Question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ol>
                    </ScrollArea>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
