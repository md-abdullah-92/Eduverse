"use client";

import { useState, useEffect, useContext } from "react";
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
import { FiFileText, FiUploadCloud, FiFile, FiCheck } from "react-icons/fi";
import { ToastContext } from "@/components/ui_elements/toast";

export default function QuizManagementPage() {
  const { showToast } = useContext(ToastContext);
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionType, setQuestionType] = useState("mcq");
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [examName, setExamName] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        handleFileProcess(file);
      } else {
        showToast("Please upload only PDF files.", "error");
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleFileProcess = async (file: File) => {
    setPdfFile(file);
    setUploadStatus('uploading');
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to detect PDF pages");
      }
      
      const data = await response.json();
      setTotalPages(data.total_pages);
      setStartPage(1);
      setEndPage(data.total_pages);
      setUploadStatus('success');
      
      showToast("PDF uploaded successfully!", "success");
    } catch (error) {
      console.error("Error detecting PDF pages:", error);
      setUploadStatus('error');
      showToast("Failed to detect PDF pages. Please try again.", "error");
    }
  };

  // Loading states for buttons
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    setUserId(uid);
  }, []);

  const handleGenerateQuiz = async () => {
    if (!pdfFile) {
      showToast("Please upload a PDF file.", "error");
      return;
    }

    if (startPage < 1) {
      showToast("Start page must be at least 1.", "error");
      return;
    }

    if (endPage !== null && endPage < startPage) {
      showToast("End page must be greater than or equal to start page.", "error");
      return;
    }

    if (totalPages !== null && endPage !== null && endPage > totalPages) {
      showToast(`End page cannot be greater than total pages (${totalPages}).`, "error");
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("n_questions", numQuestions.toString());
      formData.append("question_type", questionType);
      formData.append("start_page", startPage.toString());
      formData.append("end_page", endPage?.toString() || "");

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
      showToast("✅ Questions generated successfully!", "success");
    } catch (error) {
      console.error("Error generating quiz:", error);
      showToast("❌ Failed to generate quiz. Please check the PDF upload and try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateExam = async () => {
    if (!examName || !examDescription || selectedQuestions.length === 0) {
      showToast("Please fill in all required fields and select at least one question.", "error");
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

      showToast("✅ Exam created successfully!", "success");
      setExamName("");
      setExamDescription("");
      setDuration(null);
      setSelectedQuestions([]);
      setGeneratedQuestions([]);
    } catch (error) {
      console.error("Error creating exam:", error);
      showToast("❌ Failed to create exam. Please try again.", "error");
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

                      <Card className="border border-teal-200 shadow-md bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden">
                        <CardContent className="p-6 space-y-6">
                          {/* Enhanced PDF Upload Section */}
                          <div className="space-y-4">
                            <Label className="flex items-center gap-2 text-teal-700 font-semibold text-lg">
                              <FiFileText className="w-5 h-5" /> Upload PDF Document
                            </Label>
                            
                            {/* Drag and Drop Zone */}
                            <div
                              className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                                dragActive
                                  ? "border-teal-500 bg-teal-50/50 scale-[1.02]"
                                  : uploadStatus === 'success'
                                  ? "border-green-400 bg-green-50/30"
                                  : uploadStatus === 'error'
                                  ? "border-red-400 bg-red-50/30"
                                  : "border-gray-300 bg-gray-50/30 hover:border-teal-400 hover:bg-teal-50/20"
                              }`}
                              onDragEnter={handleDrag}
                              onDragLeave={handleDrag}
                              onDragOver={handleDrag}
                              onDrop={handleDrop}
                            >
                              <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                disabled={uploadStatus === 'uploading'}
                              />
                              
                              <div className="flex flex-col items-center justify-center text-center space-y-4">
                                {uploadStatus === 'uploading' ? (
                                  <div className="flex flex-col items-center space-y-3">
                                    <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                                    <p className="text-teal-600 font-medium">Processing PDF...</p>
                                  </div>
                                ) : uploadStatus === 'success' && pdfFile ? (
                                  <div className="flex flex-col items-center space-y-3">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                      <FiCheck className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-green-700 font-semibold">{pdfFile.name}</p>
                                      <p className="text-sm text-green-600">
                                        {totalPages} pages • {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                                      </p>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setPdfFile(null);
                                        setTotalPages(null);
                                        setUploadStatus('idle');
                                      }}
                                      className="text-gray-600 hover:text-red-600 border-gray-300"
                                    >
                                      Remove File
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center space-y-3">
                                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                                      <FiUploadCloud className="w-8 h-8 text-teal-600" />
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-lg font-semibold text-gray-700">
                                        Drop your PDF here or click to browse
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Supports PDF files up to 50MB
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                      <FiFile className="w-4 h-4" />
                                      <span>PDF documents only</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Rest of the form - only show if PDF is uploaded */}
                          {pdfFile && uploadStatus === 'success' && (
                            <div className="space-y-6 pt-4 border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="numQuestions" className="text-gray-700 font-medium">
                                    Number of Questions
                                  </Label>
                                  <Select
                                    value={numQuestions.toString()}
                                    onValueChange={(v) => setNumQuestions(Number(v))}
                                  >
                                    <SelectTrigger className="bg-white border-gray-300">
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

                                <div className="space-y-2">
                                  <Label htmlFor="questionType" className="text-gray-700 font-medium">
                                    Question Type
                                  </Label>
                                  <Select value={questionType} onValueChange={setQuestionType}>
                                    <SelectTrigger className="bg-white border-gray-300">
                                      <SelectValue placeholder="Select question type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="mcq">Multiple Choice Questions</SelectItem>
                                      <SelectItem value="short_answer">Short Answer Questions</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <Label className="text-gray-700 font-medium">
                                  Page Range {totalPages && (
                                    <span className="text-sm font-normal text-gray-500">
                                      (Total: {totalPages} pages)
                                    </span>
                                  )}
                                </Label>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="startPage" className="text-sm text-gray-600">
                                      Start Page
                                    </Label>
                                    <Input
                                      id="startPage"
                                      type="number"
                                      value={startPage}
                                      onChange={(e) => setStartPage(parseInt(e.target.value))}
                                      min={1}
                                      max={totalPages || 999}
                                      className="bg-white border-gray-300"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="endPage" className="text-sm text-gray-600">
                                      End Page
                                    </Label>
                                    <Input
                                      id="endPage"
                                      type="number"
                                      value={endPage || ""}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setEndPage(value ? parseInt(value) : null);
                                      }}
                                      min={startPage}
                                      max={totalPages || 999}
                                      className="bg-white border-gray-300"
                                    />
                                  </div>
                                </div>
                              </div>

                              <Button 
                                onClick={handleGenerateQuiz} 
                                disabled={isGenerating}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 text-lg rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
                              >
                                {isGenerating ? (
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Generating Questions...
                                  </div>
                                ) : (
                                  "🚀 Generate Quiz Questions"
                                )}
                              </Button>
                            </div>
                          )}
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