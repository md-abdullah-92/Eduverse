"use client";

import { API_URLS } from "@/lib/api/urls";
import { useState, useEffect, useContext } from "react";
import dynamic from "next/dynamic";
import { FaTasks } from "react-icons/fa";
import { FiFileText } from "react-icons/fi";
import { Type, Eye, EyeOff, Trash2, Loader2, FileText, BookOpen } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { merriweather } from "@/utils/font";
import SaveSlideButton from "@/app/teachers/components/PrintButton";
import Sidebar from "../../../../../components/Common-Components/Sidebar";
import { ToastContext } from "@/components/ui_elements/toast";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

type Question = {
  number: number;
  text: string;
};

export default function GenerateShortQuestionPage() {
  const { showToast } = useContext(ToastContext);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  
  // Page selection states
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPageSelection, setShowPageSelection] = useState(false);

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

  // Handle PDF file upload and get total pages
  const handlePdfUpload = async (file: File) => {
    setIsUploading(true);
    setPdfFile(file);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URLS.ai}/upload/`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (data.total_pages) {
        setTotalPages(data.total_pages);
        setEndPage(data.total_pages);
        setShowPageSelection(true);
        showToast(`PDF uploaded! Total pages: ${data.total_pages}`, "success");
      } else {
        showToast("Failed to read PDF pages", "error");
      }
    } catch (err) {
      console.error("PDF upload failed:", err);
      showToast("Failed to upload PDF", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateShortQuestions = async () => {
    if (!pdfFile) return showToast("Please upload a PDF file!", "error");
    
    // Validate page range
    if (startPage < 1 || (endPage && startPage > endPage)) {
      return showToast("Invalid page range!", "error");
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("start_page", startPage.toString());
      if (endPage) {
        formData.append("end_page", endPage.toString());
      }

      const res = await fetch(`${API_URLS.ai}/short-questions/`, {
        method: "POST",
        body: formData,
      });

      const markdownText = await res.text();
      
      if (res.ok) {
        setMarkdown(markdownText);

        const parsedQuestions = [
          ...markdownText.matchAll(/^\s*(\d+)\.\s+(.*)$/gm),
        ].map(([, number, text]) => ({
          number: parseInt(number),
          text: text.trim(),
        }));

        setQuestions(parsedQuestions);
        setShowEditor(true);
        showToast(`Generated ${parsedQuestions.length} questions from pages ${startPage}-${endPage || totalPages}`, "success");
      } else {
        const errorData = await res.json().catch(() => ({}));
        showToast(errorData.error || "Failed to generate questions", "error");
      }
    } catch (err) {
      console.error("Short question generation failed:", err);
      showToast("Failed to generate questions.", "error");
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
      showToast("Please provide a title and content.", "error");
      return;
    }

    if (!userId || userId === "12345") {
      showToast("Invalid or missing teacher ID.", "error");
      return;
    }

    try {
      const res = await fetch(`${API_URLS.user}/assignment`, {
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
        showToast(`Error: ${data.error}`, "error");
        return;
      }

      showToast("Short questions saved successfully!", "success");
      setMarkdown("");
      setSelectedTitle("");
      setShowEditor(false);
      setQuestions([]);
    } catch (err) {
      console.error("Failed to save:", err);
      showToast("Failed to save. Please try again.", "error");
    }
  };

  const generateMarkdownFromQuestions = () =>
    questions.map((q, idx) => `${idx + 1}. ${q.text}`).join("\n");

  const resetUpload = () => {
    setPdfFile(null);
    setTotalPages(null);
    setStartPage(1);
    setEndPage(null);
    setShowPageSelection(false);
    setShowEditor(false);
    setQuestions([]);
    setMarkdown("");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100">
      <Sidebar role="TEACHER" userId={userId} />

      <main className="min-w-0 flex-1 p-4 pt-20 sm:p-6 md:pt-6">
        <div
          className={`min-h-screen min-w-0 bg-gradient-to-br from-teal-50 to-white px-3 pb-8 sm:px-6 sm:pb-10 ${merriweather.className}`}
        >
          <header className="mb-6 pt-4 sm:pt-8">
            <h1 className="flex items-center gap-3 text-2xl font-bold text-teal-700 sm:text-3xl lg:text-4xl">
              <FaTasks />
              Generate Short Questions
            </h1>
            <p className="text-gray-600 mt-2 text-base">
              Create short questions from uploaded PDF content automatically.
            </p>
          </header>

          {/* PDF Upload Section */}
          <Card className="mb-6 p-6 bg-white border border-teal-200 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-teal-700 font-semibold text-lg">
                  <FiFileText className="w-5 h-5" />
                  PDF Upload & Configuration
                </Label>
                {pdfFile && (
                  <Button
                    onClick={resetUpload}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Reset
                  </Button>
                )}
              </div>

              {/* File Upload */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Select PDF File</Label>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handlePdfUpload(e.target.files[0]);
                      }
                    }}
                    disabled={isUploading}
                    className="file:bg-teal-50 file:text-teal-700 file:border-teal-200"
                  />
                  {isUploading && (
                    <div className="flex items-center gap-2 text-sm text-teal-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing PDF...
                    </div>
                  )}
                </div>

                {/* PDF Info */}
                {totalPages && (
                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <div className="flex items-center gap-2 text-teal-700 font-medium mb-2">
                      <BookOpen className="w-4 h-4" />
                      PDF Information
                    </div>
                    <div className="text-sm text-teal-600">
                      <p className="flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        <strong>File:</strong> {pdfFile?.name}
                      </p>
                      <p className="flex items-center gap-2 mt-1">
                        <span className="w-3 h-3 bg-teal-400 rounded-full"></span>
                        <strong>Total Pages:</strong> {totalPages}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Page Selection */}
              {showPageSelection && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                  <Label className="text-yellow-700 font-medium mb-3 block">
                    📄 Page Range Selection
                  </Label>
                  <div className="grid md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-600">Start Page</Label>
                      <Input
                        type="number"
                        min={1}
                        max={totalPages || 1}
                        value={startPage}
                        onChange={(e) => setStartPage(parseInt(e.target.value) || 1)}
                        className="border-yellow-300 focus:border-yellow-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm text-gray-600">End Page</Label>
                      <Input
                        type="number"
                        min={startPage}
                        max={totalPages || 1}
                        value={endPage || ""}
                        onChange={(e) => setEndPage(parseInt(e.target.value) || null)}
                        placeholder={`Max: ${totalPages}`}
                        className="border-yellow-300 focus:border-yellow-500"
                      />
                    </div>
                    <div className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded border">
                      <strong>Range:</strong> Page {startPage} to {endPage || totalPages}
                      <br />
                      <strong>Total:</strong> {(endPage || totalPages!) - startPage + 1} pages
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              {pdfFile && totalPages && (
                <div className="pt-2">
                  <Button
                    onClick={handleGenerateShortQuestions}
                    disabled={isLoading || isUploading}
                    className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-2 px-6 py-3"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4" />
                        Generating Questions... ({timer}s)
                      </>
                    ) : (
                      <>
                        <FaTasks className="w-4 h-4" />
                        Generate Short Questions
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {showEditor && (
            <>
              <div className="mt-10 mb-6 flex flex-col items-stretch gap-4 md:flex-row md:items-end">
                <div className="flex w-full min-w-0 items-center gap-2 rounded-lg border border-yellow-300 bg-white px-4 py-2 shadow-sm md:w-auto md:flex-1">
                  <Type className="text-yellow-600 w-5 h-5" />
                  <Input
                    className="border-none focus-visible:ring-0 text-lg placeholder:text-gray-400"
                    placeholder="Title..."
                    value={selectedTitle}
                    onChange={(e) => setSelectedTitle(e.target.value)}
                  />
                </div>

                <div className="flex w-full flex-wrap items-center gap-2 sm:gap-3 md:w-auto">
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="outline"
                    className="min-w-0 flex-1 border-yellow-300 text-yellow-700 hover:bg-yellow-50 sm:flex-none"
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
                    className="min-w-0 flex-1 bg-teal-800 text-white hover:bg-teal-500 sm:flex-none"
                  >
                    Save
                  </Button>
                </div>
              </div>

              <div
                className={`grid min-w-0 flex-1 ${
                  showPreview ? "xl:grid-cols-2" : "grid-cols-1"
                } gap-4 sm:gap-6`}
              >
                {/* Markdown Editor */}
                <Card className="h-[min(65vh,38rem)] min-h-80 min-w-0 overflow-hidden border-yellow-200 bg-white sm:h-[min(70vh,42rem)]">
                  <div className="p-4 border-b border-yellow-100">
                    <h2 className="text-lg font-semibold text-yellow-700">
                      Short Question Editor
                    </h2>
                  </div>
                  <ScrollArea className="min-h-0 flex-1 overflow-auto px-3 py-2 sm:px-4">
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
                  <Card className="h-[min(65vh,38rem)] min-h-80 min-w-0 overflow-hidden border-yellow-200 bg-white sm:h-[min(70vh,42rem)]">
                    <div className="p-4 border-b border-yellow-100">
                      <h2 className="text-lg font-semibold text-yellow-700">
                        Preview
                      </h2>
                    </div>
                    <ScrollArea className="min-h-0 flex-1 overflow-auto px-3 py-2 sm:px-4">
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