'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import GeneratedQuizSection from "@/components/quize";

// Import fonts
import { raleway, robotoSlab } from "@/utils/font";

const dummyFiles = [
  { name: "Mit18_05_s22_lec01", id: "24910588-e4a8-4bdd-9f29-09e5bc0c8a7a", date: "09/21/2024", status: "Indexed" },
  { name: "Basic-Probability", id: "adc679ef-2f69-41c7-acc7-913f8f4642aa", date: "09/21/2024", status: "Indexed" },
  { name: "Pandas", id: "d7ddb0e1-b49f-4ce3-8ed2-81a8e8c2a526", date: "09/21/2024", status: "Not Indexed" },
];

export default function GenerateQuizPage() {
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState({ mcq: true, cq: false });
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [generatedQuiz, setGeneratedQuiz] = useState<string[]>([]);

  const toggleType = (type: "mcq" | "cq") => {
    setSelectedTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const handleGenerateQuiz = () => {
    const selectedFileObjects = dummyFiles.filter((file) => selectedFiles.includes(file.id));
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
    <div className={`${raleway.className} text-gray-800`}>
      <div className={`${robotoSlab.className} flex flex-col lg:flex-row gap-6 px-0 py-10 max-w-screen-xl mx-auto w-full`}>
  

        <div className="w-full lg:w-7/12 space-y-4">
          <div>
            <h1 className="text-3xl font-semibold text-purple-700 tracking-tight">💡 Generate Quiz</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Quickly create quizzes from your saved or uploaded documents.
            </p>
          </div>

          <Card className="border shadow-md bg-gradient-to-br from-purple-50 to-white rounded-2xl">
            <CardContent className="p-8 space-y-12">

              {/* Section: Search and Upload */}
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-purple-700 tracking-tight flex items-center gap-2">
                  📂 Select Documents
                </h2>
                <p className="text-sm text-muted-foreground leading-snug">
                  Choose files to generate questions from.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <Input
                    placeholder="🔍 Search files"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs shadow-sm"
                  />
                  <Button variant="outline" size="sm" className="bg-white shadow hover:bg-gray-100">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                  <Button variant="secondary" size="sm">
                    View Library
                  </Button>
                </div>
              </div>

              {/* Section: File List */}
              <ScrollArea className="h-72 border rounded-lg bg-white/60 shadow-inner">
                <div className="divide-y">
                  {filteredFiles.length ? (
                    filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-start gap-4 p-4 hover:bg-purple-50 transition-all duration-200 ease-in-out cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedFiles.includes(file.id)}
                          onCheckedChange={() => handleFileSelect(file.id)}
                          className="mt-1"
                        />
                        <div className="space-y-1 text-sm leading-tight">
                          <p className="font-medium text-purple-800">{file.name}</p>
                          <p className="text-gray-500 text-xs">{file.id}.pdf</p>
                          <p className="text-gray-400 text-xs">{file.date}</p>
                          <p className={file.status === "Indexed" ? "text-green-600" : "text-red-500"}>
                            {file.status === "Indexed" ? "✅ Indexed" : "❌ Not Indexed"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-sm text-gray-500">No files match your search.</div>
                  )}
                </div>
              </ScrollArea>

              {/* Section: Quiz Options + Generate Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <Checkbox checked={selectedTypes.mcq} onCheckedChange={() => toggleType("mcq")} />
                    <span className="text-sm font-medium">MCQ</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <Checkbox checked={selectedTypes.cq} onCheckedChange={() => toggleType("cq")} />
                    <span className="text-sm font-medium">CQ</span>
                  </label>
                </div>

                <Button
                  onClick={handleGenerateQuiz}
                  className="rounded-full h-12 w-12 p-0 bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg hover:scale-105 transition-transform"
                >
                  <ArrowRight className="h-6 w-6 text-white" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Generated Quiz */}
        <div className="w-full lg:w-5/12">
          {generatedQuiz.length > 0 && (
            <GeneratedQuizSection quiz={generatedQuiz} />
          )}
        </div>
      </div>
    </div>
  );
}
