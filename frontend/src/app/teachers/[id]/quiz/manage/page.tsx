"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { QuizQuestion } from "@/types/quiz";
import Sidebar from "../../../../../components/Common-Components/Sidebar";
import { robotoSlab, raleway } from "@/utils/font";
import { FiFileText } from "react-icons/fi";

export default function QuizManagementPage() {
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionType, setQuestionType] = useState("mcq");
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [examName, setExamName] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // Loading states for buttons
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    setUserId(uid);
  }, []);

  const handleGenerateQuiz = async () => {
    if (!pdfFile) {
      alert("Please upload a PDF file.");
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("n_questions", numQuestions.toString());
      formData.append("question_type", questionType);

      const response = await fetch("http://localhost:8000/quiz/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions from backend");
      }

      const data = await response.json();
      console.log("Generated questions:", data);

      if (!Array.isArray(data.questions)) {
        throw new Error("Invalid response format from backend");
      }

      setGeneratedQuestions(data.questions);
      setSelectedQuestions(data.questions.map((q: QuizQuestion) => q.id));
      alert("✅ Questions generated successfully!");
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("❌ Failed to generate quiz. Please check the PDF upload and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateExam = async () => {
    if (!examName || !examDescription || selectedQuestions.length === 0) {
      alert("Please fill in all required fields and select at least one question.");
      return;
    }
    const userIdNum = parseInt(localStorage.getItem("userId") || "10", 10);

    const examData = {
      title: examName,
      description: examDescription,
      questions: generatedQuestions.filter((q) => selectedQuestions.includes(q.id)),
      duration: duration,
      teacherId: userIdNum,
    };

    setIsCreating(true);
    try {
      console.log("Creating exam:", examData);

      const response = await fetch("http://localhost:5000/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(examData),
      });

      if (!response.ok) {
        throw new Error("Server responded with an error");
      }

      const result = await response.json();
      console.log("Exam created:", result);

      alert("✅ Exam created successfully!");
      setExamName("");
      setExamDescription("");
      setDuration(null);
      setSelectedQuestions([]);
      setGeneratedQuestions([]);
    } catch (error) {
      console.error("Error creating exam:", error);
      alert("❌ Failed to create exam. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 relative overflow-hidden">
      {userId ? (
        <>
          <aside className="w-64 bg-white shadow-md p-4">
            <Sidebar role="TEACHER" userId={userId} />
          </aside>
          <main className="ml-20 p-5 flex-1">
            <div className={`${raleway.className} text-gray-800`}>
              <div
                className={`${robotoSlab.className} flex flex-col lg:flex-row gap-6 max-w-screen-xl mx-auto w-full`}
              >
                <div className="w-full lg:w-[55%] flex flex-col space-y-6">
                  {generatedQuestions.length === 0 && (
                    <>
                      <div>
                        <h1 className="text-3xl font-bold text-teal-700">
                          💡 Generate Quiz
                        </h1>
                        <p className="text-sm text-muted-foreground">
                          Quickly create quizzes for your students.
                        </p>
                      </div>

                      <Card className="border border-teal-200 shadow-md bg-white/70 backdrop-blur-md rounded-2xl">
                        <CardContent className="p-6 space-y-6">
                          <div className="space-y-2 w-full md:w-[400px]">
                            <Label
                              className="flex items-center gap-2 text-[#6941C6] font-semibold"
                              htmlFor="pdf-upload"
                            >
                              <FiFileText /> Upload PDF File
                            </Label>
                            <Input
                              id="pdf-upload"
                              type="file"
                              accept="application/pdf"
                              onChange={(e) =>
                                setPdfFile(e.target.files?.[0] || null)
                              }
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="numQuestions">
                              Number of Questions
                            </Label>
                            <Select
                              value={numQuestions.toString()}
                              onValueChange={(v) => setNumQuestions(Number(v))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select number of questions" />
                              </SelectTrigger>
                              <SelectContent>
                                {[5, 10, 15, 20].map((num) => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num} Questions
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="questionType">Question Type</Label>
                            <Select
                              value={questionType}
                              onValueChange={setQuestionType}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select question type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mcq">
                                  Multiple Choice Questions
                                </SelectItem>
                                <SelectItem value="short_answer">
                                  Comprehension Questions
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Button onClick={handleGenerateQuiz} disabled={isGenerating}>
                            {isGenerating ? "Generating..." : "Generate Quiz"}
                          </Button>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {generatedQuestions.length > 0 && (
                    <Card className="border border-teal-200 shadow-md bg-white/70 backdrop-blur-md rounded-2xl">
                      <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                          <h2 className="text-2xl font-semibold text-teal-700">
                            📝 Create Exam
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Finalize your quiz and prepare for the exam.
                          </p>
                        </div>

                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="examName">Exam Title</Label>
                            <Input
                              id="examName"
                              value={examName}
                              onChange={(e) => setExamName(e.target.value)}
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="examDescription">Description</Label>
                            <Textarea
                              id="examDescription"
                              value={examDescription}
                              onChange={(e) => setExamDescription(e.target.value)}
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                              id="duration"
                              type="number"
                              min={1}
                              value={duration ?? ""}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setDuration(isNaN(val) ? null : val);
                              }}
                            />
                          </div>
                          <Button
                            onClick={handleCreateExam}
                            disabled={isCreating}
                            className="w-full"
                          >
                            {isCreating ? "Creating Exam..." : "Create Exam"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="w-full lg:w-[45%] space-y-6 max-h-[85vh] overflow-y-auto pr-2">
                  {generatedQuestions.length > 0 && (
                    <>
                      <div>
                        <h2 className="text-3xl font-bold text-teal-700">
                          📚 Generated Questions
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Select questions to include in your exam.
                        </p>
                      </div>

                      <Card>
                        <CardContent className="p-6 space-y-6">
                          {generatedQuestions.map((q, idx) => (
                            <div
                              key={q.id}
                              className="flex items-start gap-4 border-b pb-4"
                            >
                              <input
                                type="checkbox"
                                className="mt-2"
                                checked={selectedQuestions.includes(q.id)}
                                onChange={(e) => {
                                  setSelectedQuestions((prev) =>
                                    e.target.checked
                                      ? [...prev, q.id]
                                      : prev.filter((id) => id !== q.id)
                                  );
                                }}
                              />
                              <div className="space-y-2">
                                <p className="font-semibold text-gray-800">
                                  Q{idx + 1}: {q.question}
                                </p>
                                {q.type === "mcq" &&
                                  q.options?.map((opt, i) => (
                                    <div key={i} className="ml-4 text-sm">
                                      {opt}
                                    </div>
                                  ))}
                                <p className="text-sm text-green-700 font-medium">
                                  ✅ Correct Answer: {q.correctAnswer}
                                </p>
                                {q.explanation && (
                                  <p className="text-sm italic text-gray-600">
                                    Explanation: {q.explanation}
                                  </p>
                                )}
                                <p className="text-sm text-gray-500">
                                  Difficulty: {q.difficulty}
                                </p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>
            </div>
          </main>
        </>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      )}
    </div>
  );
}
