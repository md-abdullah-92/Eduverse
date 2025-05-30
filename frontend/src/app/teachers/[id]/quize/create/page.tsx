'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import GeneratedQuizSection from "@/components/quize";

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
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<{ mcq: boolean; cq: boolean }>({
    mcq: true,
    cq: false,
  });
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [generatedQuiz, setGeneratedQuiz] = useState<string[]>([]);

  const toggleType = (type: "mcq" | "cq") => {
    setSelectedTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles((prevSelected) =>
      prevSelected.includes(fileId)
        ? prevSelected.filter((id) => id !== fileId)
        : [...prevSelected, fileId]
    );
  };

  const handleGenerateQuiz = () => {
    const selectedFileObjects = dummyFiles.filter((file) => selectedFiles.includes(file.id));
    console.log("Selected Files:", selectedFileObjects);
    console.log("Selected Types:", selectedTypes);
    // Simulated generated quiz
    setGeneratedQuiz([
      "Q1. What is the probability of getting heads in a fair coin toss?",
      "Q2. Define the term 'DataFrame' in Pandas.",
    ]);
  };

  const filteredFiles = dummyFiles.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
      {/* Left Column - Quiz Generator */}
      <div className="w-full lg:w-1/2">
        <h1 className="text-3xl font-bold text-purple-700 mb-2">💡 Generate Quiz</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Easily generate quizzes from your uploaded or saved documents.
        </p>

        <Card className="border shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-purple-600 mb-1">📄 Create Quiz</h2>
              <p className="text-sm text-muted-foreground">
                Select from the library or upload new documents to generate a quiz.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Input
                placeholder="🔍 Search files"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs"
              />
              <div className="flex gap-2">
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button variant="secondary">View Library</Button>
              </div>
            </div>

            <ScrollArea className="h-64 rounded-md border">
              <div className="divide-y">
                {filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-start gap-4 p-4 hover:bg-muted transition-colors cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedFiles.includes(file.id)}
                        onCheckedChange={() => handleFileSelect(file.id)}
                        className="mt-1"
                      />
                      <div className="space-y-1">
                        <p className="font-medium text-purple-700">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.id}.pdf</p>
                        <p className="text-xs text-gray-400">{file.date}</p>
                        <p
                          className={`text-sm ${
                            file.status === "Indexed" ? "text-green-600" : "text-red-500"
                          }`}
                        >
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

            {/* Bottom Options */}
            <div className="flex items-center justify-between mt-4">
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
              <Button
                onClick={handleGenerateQuiz}
                className="rounded-full h-12 w-12 p-0 bg-purple-700 hover:bg-purple-800"
              >
                <ArrowRight className="h-6 w-6 text-white" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Generated Quiz Display */}
      <div className="w-full lg:w-1/2">
      <GeneratedQuizSection/>
      </div>
    </div>
  );
}
