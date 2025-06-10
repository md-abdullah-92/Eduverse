"use client";

import ChatWidget from "@/app/lesson/ChatWidget";
import GeneratedQuizSection from "@/app/teachers/[id]/quiz/create/components/quize";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar";

// Import fonts
import { raleway, robotoSlab } from "@/utils/font";

const dummyFiles = [
  {
    name: "Mit18_05_s22_lec01",
    id: "24910588-e4a8-4bdd-9f29-09e5bc0c8a7a",
    date: "09/21/2024",
    status: "Indexed",
  },
  {
    name: "Basic-Probability",
    id: "adc679ef-2f69-41c7-acc7-913f8f4642aa",
    date: "09/21/2024",
    status: "Indexed",
  },
  {
    name: "Pandas",
    id: "d7ddb0e1-b49f-4ce3-8ed2-81a8e8c2a526",
    date: "09/21/2024",
    status: "Not Indexed",
  },
];

export default function GenerateQuizPage() {
  const [userId, setUserId] = useState<string>("12345");

  useEffect(() => {
    const localUserId = localStorage.getItem("userId");
    if (localUserId) {
      setUserId(localUserId);
    }
  }, []);
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState({ mcq: true, cq: false });
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [generatedQuiz, setGeneratedQuiz] = useState<string[]>([]);

  const toggleType = (type: "mcq" | "cq") => {
    setSelectedTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleGenerateQuiz = () => {
    const selectedFileObjects = dummyFiles.filter((file) =>
      selectedFiles.includes(file.id)
    );
    console.log("Selected Files:", selectedFileObjects);
    console.log("Selected Types:", selectedTypes);

    setGeneratedQuiz([
      "Q1. What is the probability of getting heads in a fair coin toss?",
      "Q2. Define the term 'DataFrame' in Pandas.",
    ]);
  };

  const filteredFiles = dummyFiles.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 relative overflow-hidden">
      {userId && (
        <>
          <aside className="w-64 bg-white shadow-md p-4">
        <Sidebar role="TEACHER" userId={userId} />
      </aside>
      <main className="ml-20 p-5 flex-1">
        <div className={`${raleway.className} text-gray-800`}>
          <div
            className={`${robotoSlab.className} flex flex-col lg:flex-row gap-3 px-0 py-3 max-w-screen-xl mx-auto w-full`}
          >
            {/* Left Panel: Quiz Generator */}
            {/* Left Panel: Quiz Generator */}
            <div className="w-full lg:w-[55%] space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-teal-700">
                  💡 Generate Quiz
                </h1>
                <p className="text-sm text-muted-foreground">
                  Quickly create quizzes from your saved or uploaded documents.
                </p>
              </div>

              <Card className="border border-teal-200 shadow-md bg-white/70 backdrop-blur-md rounded-2xl">
                <CardContent className="p-6 space-y-6">
                  {/* Section: File Selection */}
                  <div>
                    <h2 className="text-xl font-semibold text-teal-700 flex items-center gap-2">
                      📂 Select Documents
                    </h2>
                    <p className="text-sm text-muted-foreground mb-3">
                      Choose one or more documents to generate questions from.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <Input
                        placeholder="🔍 Search files"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-xs shadow-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white shadow hover:bg-gray-100"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      <Button variant="secondary" size="sm">
                        View Library
                      </Button>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Section: File List */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                      Your Files
                    </h3>
                    <ScrollArea className="h-72 border rounded-md bg-white/50 shadow-inner">
                      <div className="divide-y">
                        {filteredFiles.length ? (
                          filteredFiles.map((file) => (
                            <div
                              key={file.id}
                              className="flex items-start gap-4 p-3 hover:bg-teal-50 transition-colors cursor-pointer"
                            >
                              <Checkbox
                                checked={selectedFiles.includes(file.id)}
                                onCheckedChange={() =>
                                  handleFileSelect(file.id)
                                }
                                className="mt-1"
                              />
                              <div className="text-sm space-y-0.5">
                                <p className="font-medium text-teal-800">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {file.id}.pdf
                                </p>
                                <p className="text-xs text-gray-400">
                                  {file.date}
                                </p>
                                <p
                                  className={
                                    file.status === "Indexed"
                                      ? "text-green-600"
                                      : "text-red-500"
                                  }
                                >
                                  {file.status === "Indexed"
                                    ? "✅ Indexed"
                                    : "❌ Not Indexed"}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-sm text-gray-500">
                            No files match your search.
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Section: Quiz Type Selection */}
                  <div className="p-4 bg-teal-50 rounded-lg border border-teal-200 shadow-sm">
                    <h4 className="text-sm font-semibold text-teal-700 mb-2">
                      Question Types
                    </h4>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedTypes.mcq}
                          onCheckedChange={() => toggleType("mcq")}
                        />
                        <span className="text-sm font-medium">MCQ</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedTypes.cq}
                          onCheckedChange={() => toggleType("cq")}
                        />
                        <span className="text-sm font-medium">CQ</span>
                      </label>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="flex justify-end pt-1">
                    <Button
                      onClick={handleGenerateQuiz}
                      className="rounded-full h-12 w-12 p-0 bg-gradient-to-br from-emerald-500 to-teal-700 shadow-md hover:scale-105"
                    >
                      <ArrowRight className="h-6 w-6 text-white" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel: Generated Quiz Preview */}
            <div className="w-full lg:w-1/2 space-y-4">
              {generatedQuiz.length > 0 && (
                <GeneratedQuizSection quiz={generatedQuiz} />
              )}
            </div>

            <ChatWidget userId={userId} />
          </div>
        </div>
        </main>
        </>
      )}
    </div>
  );
}
