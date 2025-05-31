'use client';

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Save, Type, Eye, EyeOff } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "easymde/dist/easymde.min.css";
import { ScrollArea } from "@/components/ui/scroll-area";
import { merriweather } from "@/utils/font"; // ← apply font
import Sidebar from "../components/Sidebar";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

export default function GenerateSlidePage() {
  const [title, setTitle] = useState("Statistics");
  const [markdown, setMarkdown] = useState(`## Study Contents

### 1. Statistics

**Definition:** Statistics is the science of collecting, organizing, analyzing, interpreting, and presenting data. It helps us understand and draw meaningful conclusions from information.

**Key Concepts:**

* **Data:** Raw, unorganized facts and figures.
* **Population:** The entire group of individuals or objects being studied.
* **Sample:** A subset of the population that is used to represent the whole group.
* **Variable:** A characteristic that can be measured or counted.
* **Measures of Central Tendency:** Mean, median, and mode.
* **Measures of Dispersion:** Range, variance, and standard deviation.
* **Data Visualization:** Graphs and charts used to present data visually.
* **Statistical Inference:** Using sample data to make conclusions about the population.
`);
  const [showPreview, setShowPreview] = useState(true);
  const userId = localStorage.getItem("userId") || "12345"; // Fallback for demo purposes
  console.log(userId);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 relative overflow-hidden">
   
      
    <Sidebar role="TEACHER" userId={userId} /> 
   <main className="flex-1 p-8 space-y-8 relative z-10">
    <div className={`min-h-screen bg-gradient-to-br from-teal-50 to-white px-6 pb-10 flex flex-col ${merriweather.className}`}>
      <header className="mb-6 pt-8">
        <h1 className="text-4xl font-bold text-teal-800 flex items-center gap-3">
          <Save className="w-7 h-7" /> Slide Generator
        </h1>
        <p className="text-gray-600 mt-2 text-base">
          Create beautifully formatted learning slides from your notes.
        </p>
      </header>

      <div className="flex flex-col md:flex-row items-start md:items-end gap-4 mb-6">
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

          <Button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md shadow-md">
            <Save className="w-4 h-4 mr-2" />
            Save Slide
          </Button>
        </div>
      </div>

      <div className={`flex-1 grid ${showPreview ? 'md:grid-cols-2' : 'grid-cols-1'} gap-6`}>
        <div className="h-full flex flex-col">
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
        </div>

        {showPreview && (
          <div className="h-full flex flex-col">
            <Card className="h-[calc(100vh-300px)] flex flex-col bg-white rounded-xl border border-teal-200 shadow-md overflow-hidden">
              <div className="p-4 border-b border-teal-100">
                <h2 className="text-lg font-semibold text-teal-700">Slide Preview</h2>
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
                    code: ({ inline, ...props }) =>
                      inline
                        ? <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />
                        : <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto my-3" {...props} />,
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
          </div>
        )}
      </div>
    </div>
    </main>
    </div>
  );
}
