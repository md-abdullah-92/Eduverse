"use client";

import { useState, useContext } from "react";
import dynamic from "next/dynamic";
import { FaFileAlt, FaFileUpload } from "react-icons/fa";
import { FiFileText } from "react-icons/fi";
import { Type, Eye, EyeOff, BookOpen, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "12345" : "12345";

  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      
      if (file.type !== "application/pdf") {
        showToast("Please select a valid PDF file.", "error");
        return;
      }

      setSelectedFile(file);
      setTitle(file.name.replace(".pdf", ""));
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await fetch("http://localhost:8000/upload/", {
          method: "POST",
          body: formData,
        });
        
        if (!res.ok) {
          throw new Error("Failed to upload PDF");
        }
        
        const data = await res.json();
        if (data.total_pages) {
          setTotalPages(data.total_pages);
          setStartPage(1);
          setEndPage(data.total_pages);
          showToast(`PDF uploaded successfully! Found ${data.total_pages} pages.`, "success");
        } else if (data.error) {
          throw new Error(data.error);
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (error) {
        console.error("Error uploading PDF:", error);
        showToast(`Failed to upload PDF: ${error}`, "error");
        setSelectedFile(null);
        setTotalPages(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleGenerateMarkdown = async () => {
    if (!selectedFile) {
      showToast("Please select a PDF file first!", "error");
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

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("start_page", startPage.toString());
      formData.append("end_page", endPage?.toString() || totalPages?.toString() || "");

      const res = await fetch("http://localhost:8000/generate-study-notes/", {
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
      showToast(`Study notes generated successfully from pages ${startPage} to ${endPage || totalPages}!`, "success");
    } catch (err) {
      console.error("Study notes generation failed:", err);
      showToast("Failed to generate study notes. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const saveStudyNote = async (title: string, description: string) => {
    if (!title.trim() || !description.trim()) {
      showToast("Please provide both title and content for the Study Note.", "error");
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
      // Reset form after successful save
      setMarkdown("");
      setSelectedFile(null);
      setShowSlideEditor(false);
      setTitle("");
      setTotalPages(null);
      setStartPage(1);
      setEndPage(null);

    } catch (err) {
      console.error("Failed to save study note:", err);
      showToast("Failed to save study note. Please try again.", "error");
    }
  };

  const handleSelectAllPages = () => {
    if (totalPages) {
      setStartPage(1);
      setEndPage(totalPages);
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
            <p className="text-gray-600 mt-2 text-base">Upload a PDF and generate structured study notes from selected pages.</p>
          </header>

          {/* File Upload Section */}
          <Card className="p-6 mb-6 border-2 border-dashed border-teal-300 bg-white/50">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FaFileUpload className="text-teal-600 text-xl" />
                <Label className="text-lg font-semibold text-teal-700">Upload PDF Document</Label>
              </div>
              
              <Input 
                type="file" 
                accept="application/pdf" 
                onChange={handleFileChange}
                disabled={isUploading}
                className="file:bg-teal-100 file:text-teal-700 file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4"
              />
              
              {isUploading && (
                <div className="flex items-center gap-2 text-teal-600">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Analyzing PDF...</span>
                </div>
              )}

              {selectedFile && totalPages && (
                <div className="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="text-teal-600" size={20} />
                      <span className="font-medium text-teal-800">{selectedFile.name}</span>
                    </div>
                    <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                      {totalPages} pages
                    </Badge>
                  </div>
                  
                  {/* Page Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-teal-700">Select Page Range</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="startPage" className="text-xs text-gray-600">Start Page</Label>
                        <Input
                          id="startPage"
                          type="number"
                          value={startPage}
                          onChange={(e) => setStartPage(Math.max(1, parseInt(e.target.value) || 1))}
                          min={1}
                          max={totalPages}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endPage" className="text-xs text-gray-600">End Page</Label>
                        <Input
                          id="endPage"
                          type="number"
                          value={endPage || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            setEndPage(value ? Math.min(totalPages, parseInt(value)) : null);
                          }}
                          min={startPage}
                          max={totalPages}
                          placeholder={`Max: ${totalPages}`}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          onClick={handleSelectAllPages}
                          variant="outline"
                          size="sm"
                          className="w-full border-teal-300 text-teal-700 hover:bg-teal-50"
                        >
                          Select All Pages
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                      <strong>Selected:</strong> Page {startPage} to {endPage || totalPages} 
                      <span className="ml-2 text-teal-600">
                        ({((endPage || totalPages) - startPage + 1)} pages)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Generate Button */}
          {selectedFile && totalPages && (
            <div className="mb-6">
              <Button
                onClick={handleGenerateMarkdown}
                disabled={isLoading}
                size="lg"
                className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-3 px-8 py-3"
              >
                {isLoading && (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                )}
                <BookOpen size={20} />
                {isLoading ? "Generating Study Notes..." : "Generate Study Notes"}
              </Button>
            </div>
          )}

          {showSlideEditor && (
            <>
              {/* Title and Controls */}
              <Card className="p-4 mb-6 bg-white">
                <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="title" className="flex items-center gap-2 text-teal-700 font-semibold">
                      <Type size={16} />
                      Study Note Title
                    </Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a descriptive title for your study note"
                      className="text-lg"
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
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                      disabled={!title.trim() || !markdown.trim()}
                    >
                      Save Study Note
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Editor and Preview */}
              <div className={`flex-1 grid ${showPreview ? "lg:grid-cols-2" : "grid-cols-1"} gap-6`}>
                {/* MARKDOWN EDITOR */}
                <Card className="h-[calc(100vh-300px)] flex flex-col bg-white rounded-xl border border-teal-200 shadow-md overflow-hidden">
                  <div className="p-4 border-b border-teal-100">
                    <h2 className="text-lg font-semibold text-teal-700 flex items-center gap-2">
                      <FiFileText />
                      Markdown Editor
                    </h2>
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
                      <h2 className="text-lg font-semibold text-teal-700 flex items-center gap-2">
                        <Eye />
                        Study Note Preview
                      </h2>
                    </div>
                    <ScrollArea className="flex-1 overflow-auto px-6 py-4">
                      {title && <h1 className="text-3xl font-bold text-teal-800 mb-6">{title}</h1>}
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: (props) => <h1 className="text-3xl font-bold mt-6 mb-4 text-teal-800 border-b-2 border-teal-200 pb-2" {...props} />,
                          h2: (props) => <h2 className="text-2xl font-bold mt-5 mb-3 text-teal-700" {...props} />,
                          h3: (props) => <h3 className="text-xl font-semibold mt-4 mb-2 text-teal-600" {...props} />,
                          h4: (props) => <h4 className="text-lg font-medium mt-3 mb-2 text-teal-500" {...props} />,
                          p: (props) => <p className="text-gray-700 mb-4 leading-relaxed text-base" {...props} />,
                          ul: (props) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                          ol: (props) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                          li: (props) => <li className="text-gray-700" {...props} />,
                          strong: (props) => <strong className="font-bold text-teal-700" {...props} />,
                          em: (props) => <em className="italic text-teal-600" {...props} />,
                          del: (props) => <del className="line-through opacity-75" {...props} />,
                          a: (props) => <a className="text-teal-600 hover:text-teal-800 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                          code({ inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline && match ? (
                              <SyntaxHighlighter style={oneLight} language={match[1]} PreTag="div" className="rounded-lg my-4 border border-gray-200" {...props}>
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            ) : (
                              <code className="bg-teal-50 text-teal-800 px-2 py-1 rounded text-sm font-mono border border-teal-200" {...props}>
                                {children}
                              </code>
                            );
                          },
                          blockquote: (props) => (
                            <blockquote className="border-l-4 border-teal-400 pl-4 italic text-gray-700 my-4 bg-teal-50 py-2 rounded-r" {...props} />
                          ),
                          hr: (props) => <hr className="my-6 border-teal-200" {...props} />,
                          table: (props) => (
                            <div className="overflow-x-auto my-4">
                              <table className="min-w-full border-collapse border border-teal-200 rounded-lg overflow-hidden" {...props} />
                            </div>
                          ),
                          th: (props) => <th className="border border-teal-200 px-4 py-2 bg-teal-100 font-semibold text-teal-800 text-left" {...props} />,
                          td: (props) => <td className="border border-teal-200 px-4 py-2 text-gray-700" {...props} />,
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