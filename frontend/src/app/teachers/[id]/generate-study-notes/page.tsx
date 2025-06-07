"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { FaFileAlt } from "react-icons/fa";
import { FiFileText } from "react-icons/fi";
import {  Type, Eye, EyeOff } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { merriweather } from "@/utils/font";
import Sidebar from "../../components/Sidebar";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import SaveSlideButton from "./components/PrintButton";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

const topics = [
  "Artificial Intelligence",
  "Machine Learning",
  "Data Structures",
  "Networking",
  "Cybersecurity",
  "Cloud Computing",
];

export default function GenerateSlidePage() {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [showSlideEditor, setShowSlideEditor] = useState(false);
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "12345" : "12345";

  const handleGenerateMarkdown = async () => {
    if (!selectedTopic) return alert("Please select or enter a topic!");

    try {
      const res = await fetch("/api/generate-markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTopic }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      setMarkdown(data.markdown || "");
      setShowSlideEditor(true);
    } catch (err) {
      console.error("Markdown generation failed:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 relative overflow-hidden">
      <aside className="w-64 bg-white shadow-md p-4">
        <Sidebar role="TEACHER" userId={userId} />
      </aside>
      <main className="ml-20 p-5 flex-1">
        <div className={`min-h-screen bg-gradient-to-br from-teal-50 to-white px-6 pb-10 flex flex-col ${merriweather.className}`}>
          {/* HEADER */}
          <header className="mb-6 pt-8">
            <h1 className="text-4xl font-bold text-teal-800 flex items-center gap-3">
              <FaFileAlt />
              Generate Study Notes
            </h1>
            <p className="text-gray-600 mt-2 text-base">
              Create beautifully formatted Study Notes for your students.
            </p>
          </header>

          {/* TOPIC SELECT */}
          <div className="mt-4 space-y-2 w-full md:w-[400px]">
            <Label className="flex items-center gap-2 text-[#6941C6] font-semibold">
              <FiFileText />
              Select or Enter a Topic
            </Label>
            <Combobox
              options={topics}
              placeholder="Type or select a topic"
              selected={selectedTopic}
              onSelect={setSelectedTopic}
              allowCustom={true}
            />
            <Button onClick={handleGenerateMarkdown} className="mt-4 bg-teal-600 hover:bg-teal-700 text-white">
              Generate Study Note
            </Button>
          </div>

          {/* SLIDE EDITOR & PREVIEW */}
          {showSlideEditor && (
            <>
              <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mt-10 mb-6">
                <div className="w-full md:w-auto flex items-center gap-2 bg-white border border-teal-300 rounded-lg shadow-sm px-4 py-2">
                  <Type className="text-teal-600 w-5 h-5" />
                  <Input
                    className="border-none focus-visible:ring-0 text-lg placeholder:text-gray-400"
                    placeholder="Enter slide title..."
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
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

                    <SaveSlideButton title={selectedTopic} />
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
                          "link", "image", "|", "preview", "guide"
                        ]
                      }}
                    />
                  </ScrollArea>
                </Card>

                {/* MARKDOWN PREVIEW */}
                {showPreview && (
                  <Card id="slide-preview"  
                  className="h-[calc(100vh-300px)] flex flex-col bg-white rounded-xl border border-teal-200 shadow-md overflow-hidden">
                    <div className="p-4 border-b border-teal-100">
                      <h2 className="text-lg font-semibold text-teal-700">Note Preview</h2>
                    </div>
                    <ScrollArea className="flex-1 overflow-auto px-4 py-2">
                      <h2 className="text-2xl font-bold text-teal-700 mb-4">{selectedTopic}</h2>
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
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter
                                style={oneLight}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-md my-3"
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
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
                          th: (props) => (
                            <th className="border border-gray-300 px-3 py-1 bg-gray-100 font-semibold text-left" {...props} />
                          ),
                          td: (props) => (
                            <td className="border border-gray-300 px-3 py-1" {...props} />
                          ),
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
