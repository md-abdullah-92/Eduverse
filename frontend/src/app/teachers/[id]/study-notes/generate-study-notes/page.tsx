"use client";

import { useState, useContext } from "react";
import dynamic from "next/dynamic";
import { FaFileAlt } from "react-icons/fa";
import { FiFileText } from "react-icons/fi";
import { Type, Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { merriweather } from "@/utils/font";
import Sidebar from "@/components/Common-Components/Sidebar";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import SaveSlideButton from "./components/PrintButton";
import { ToastContext } from "@/components/ui_elements/toast";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

export default function GenerateSlidePage() {
  const { showToast } = useContext(ToastContext);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [showSlideEditor, setShowSlideEditor] = useState(false);
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "12345" : "12345";

  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);  // Loading state added

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setTitle(e.target.files[0].name.replace(".pdf", ""));
    }
  };

  const handleGenerateMarkdown = async () => {
    if (!selectedFile) {
      showToast("Please select a PDF file!", "error");
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      showToast("Only PDF files are supported.", "error");
      return;
    }

    setIsLoading(true);  // Start loading

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("http://localhost:8000/study-notes/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        showToast(data.error || "Something went wrong while generating study notes.", "error");
        return;
      }

      console.log("Generated Study Note:", data);
      setMarkdown(data.notes || "");
      setShowSlideEditor(true);
    } catch (err) {
      console.error("Markdown generation failed:", err);
      showToast("Failed to generate study note.", "error");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const saveStudyNote = async (title: string, description: string) => {
    if (!title || !description) {
      showToast("Please provide a title and content for the Study Note.", "error");
      return;
    }

    if (!userId || userId === "12345") {
      showToast("Invalid or missing teacher ID.", "error");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/studynote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, teacherId: parseInt(userId) }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Server error:", data.error);
        showToast(`Error: ${data.error}`, "error");
        return;
      }

      showToast("Study Note saved successfully!", "success");
      setMarkdown("");
      setSelectedFile(null);

    } catch (err) {
      console.error("Failed to save assignment:", err);
      showToast("Failed to save assignment. Please try again.", "error");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 relative overflow-hidden">
      <aside className="w-64 bg-white shadow-md p-4">
        <Sidebar role="TEACHER" userId={userId} />
      </aside>
      <main className="ml-20 p-5 flex-1">
        <div className={`min-h-screen bg-gradient-to-br from-teal-50 to-white px-6 pb-10 flex flex-col ${merriweather.className}`}>
          <header className="mb-6 pt-8">
            <h1 className="text-4xl font-bold text-teal-800 flex items-center gap-3">
              <FaFileAlt />
              Generate Study Notes
            </h1>
            <p className="text-gray-600 mt-2 text-base">Upload a PDF and generate structured study notes.</p>
          </header>

          <div className="mt-4 space-y-2 w-full md:w-[400px]">
            <Label className="flex items-center gap-2 text-[#6941C6] font-semibold">
              <FiFileText />
              Select PDF File
            </Label>
            <Input type="file" accept="application/pdf" onChange={handleFileChange} />
            <Button
              onClick={handleGenerateMarkdown}
              disabled={isLoading}
              className="mt-4 bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
            >
              {isLoading && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              )}
              {isLoading ? "Generating..." : "Generate Study Note"}
            </Button>
          </div>

          {showSlideEditor && (
            <>
              <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mt-10 mb-6">
                <div className="w-full md:w-auto flex items-center gap-2 bg-white border border-teal-300 rounded-lg shadow-sm px-4 py-2">
                  <Type className="text-teal-600 w-5 h-5" />
                  <Input
                    className="border-none focus-visible:ring-0 text-lg placeholder:text-gray-400"
                    placeholder="Enter slide title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="outline"
                    className="border-teal-300 text-teal-700 hover:bg-teal-50"
                  >
                    {showPreview ? <EyeOff className="mr-2 w-4 h-4" /> : <Eye className="mr-2 w-4 h-4" />}
                    {showPreview ? "Hide Preview" : "Show Preview"}
                  </Button>

                  <SaveSlideButton title={title} />
                  <Button
                    onClick={() => saveStudyNote(title, markdown)}
                    variant="outline"
                    className="border-teal-300 text-teal-700 hover:bg-teal-50"
                  >
                    Save
                  </Button>
                </div>
              </div>

              <div className={`flex-1 grid ${showPreview ? "md:grid-cols-2" : "grid-cols-1"} gap-6`}>
                {/* MARKDOWN EDITOR */}
                <Card className="h-[calc(100vh-300px)] flex flex-col bg-white rounded-xl border border-teal-200 shadow-md overflow-hidden">
                  <div className="p-4 border-b border-teal-100">
                    <h2 className="text-lg font-semibold text-teal-700">Markdown Editor</h2>
                  </div>
                  <ScrollArea className="flex-1 overflow-auto px-4 py-2">
                    <SimpleMDE
                      value={markdown}
                      onChange={setMarkdown}
                      className="h-full"
                      options={{
                        spellChecker: false,
                        minHeight: "100%",
                        autofocus: true,
                        toolbar: [
                          "bold", "italic", "heading", "|",
                          "quote", "unordered-list", "ordered-list", "|",
                          "link", "image", "|", "preview", "guide",
                        ],
                      }}
                    />
                  </ScrollArea>
                </Card>

                {/* MARKDOWN PREVIEW */}
                {showPreview && (
                  <Card id="slide-preview" className="h-[calc(100vh-300px)] flex flex-col bg-white rounded-xl border border-teal-200 shadow-md overflow-hidden">
                    <div className="p-4 border-b border-teal-100">
                      <h2 className="text-lg font-semibold text-teal-700">Note Preview</h2>
                    </div>
                    <ScrollArea className="flex-1 overflow-auto px-4 py-2">
                      <h2 className="text-2xl font-bold text-teal-700 mb-4">{title}</h2>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: (props) => <h1 className="text-3xl font-bold mt-4 mb-3 text-teal-800" {...props} />,
                          h2: (props) => <h2 className="text-2xl font-bold mt-3 mb-2 text-teal-700" {...props} />,
                          h3: (props) => <h3 className="text-xl font-semibold mt-3 mb-2 text-teal-600" {...props} />,
                          h4: (props) => <h4 className="text-lg font-medium mt-2 mb-1 text-teal-500" {...props} />,
                          p: (props) => <p className="text-gray-700 mb-3 leading-relaxed" {...props} />,
                          ul: (props) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                          ol: (props) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                          li: (props) => <li className="text-gray-700 mb-1" {...props} />,
                          strong: (props) => <strong className="font-bold text-teal-600" {...props} />,
                          em: (props) => <em className="italic" {...props} />,
                          del: (props) => <del className="line-through" {...props} />,
                          a: (props) => <a className="text-teal-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                          code({ inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline && match ? (
                              <SyntaxHighlighter style={oneLight} language={match[1]} PreTag="div" className="rounded-md my-3" {...props}>
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            ) : (
                              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                                {children}
                              </code>
                            );
                          },
                          blockquote: (props) => (
                            <blockquote className="border-l-4 border-teal-300 pl-3 italic text-gray-600 my-3" {...props} />
                          ),
                          hr: (props) => <hr className="my-4 border-gray-200" {...props} />,
                          table: (props) => (
                            <div className="overflow-x-auto">
                              <table className="min-w-full border-collapse my-3" {...props} />
                            </div>
                          ),
                          th: (props) => <th className="border border-gray-300 px-3 py-1 bg-gray-100 font-semibold text-left" {...props} />,
                          td: (props) => <td className="border border-gray-300 px-3 py-1" {...props} />,
                        }}
                      >
                        {markdown}
                      </ReactMarkdown>
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
