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
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { QuizQuestion } from "@/types/quiz";
import Sidebar from "../../components/Sidebar";
import { robotoSlab, raleway } from "@/utils/font";
import { FiFileText } from "react-icons/fi";
import { Combobox } from "@/components/ui/combobox";

export default function QuizManagementPage() {
  const [topic, setTopic] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionType, setQuestionType] = useState("mcq");
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [examName, setExamName] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const [tags, setTags] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [scheduleTime, setScheduleTime] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const topics = [
    "Mathematics", "Physics", "Chemistry", "Biology",
    "Computer Science", "History", "Geography",
    "Bangla Literature", "English Grammar",
    "Programming Fundamentals", "Data Structures",
    "Algorithms", "Databases", "Operating Systems",
    "Networking", "Artificial Intelligence", "Machine Learning",
    "Web Development", "Mobile App Development"
  ];

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    setUserId(uid);
  }, []);

  const handleGenerateQuiz = async () => {
    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic || topic,
          numQuestions,
          questionType,
        }),
      });
      const data = await response.json();
      console.log("Generated Quiz Data:", data);
      if (data.error) throw new Error(data.error);
      setGeneratedQuestions(data.quiz.questions);
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Failed to generate quiz. Please try again.");
    }
  };

  const handleCreateExam = async () => {
    if (!examName || !examDescription || selectedQuestions.length === 0) {
      alert("Please fill in all required fields and select at least one question.");
      return;
    }

    const examData = {
      name: examName,
      description: examDescription,
      questions: generatedQuestions.filter(q => selectedQuestions.includes(q.id)),
      totalMarks: selectedQuestions.length,
      tags,
      duration,
      scheduleTime,
    };

    try {
      console.log("Creating exam:", examData);
      alert("Exam created successfully!");
    } catch (error) {
      console.error("Error creating exam:", error);
      alert("Failed to create exam. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 relative overflow-hidden">
      {userId ? (
        <>
          <Sidebar role="TEACHER" userId={userId} />
          <main className="flex-1 p-8 space-y-8 relative z-10">
            <div className={`${raleway.className} text-gray-800`}>
              <div className={`${robotoSlab.className} flex flex-col lg:flex-row gap-6 px-0 py-3 max-w-screen-xl mx-auto w-full`}>
                
                {/* Left Panel */}
                <div className="w-full lg:w-[55%] flex flex-col space-y-6">
                  {/* Quiz Generator */}
                  { generatedQuestions.length === 0 && (
                    <>
                  <div>
                    <h1 className="text-3xl font-bold text-teal-700">💡 Generate Quiz</h1>
                    <p className="text-sm text-muted-foreground">Quickly create quizzes for your students.</p>
                  </div>

                  <Card className="border border-teal-200 shadow-md bg-white/70 backdrop-blur-md rounded-2xl">
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2 w-full md:w-[400px]">
                        <Label className="flex items-center gap-2 text-[#6941C6] font-semibold">
                          <FiFileText /> Select or Enter a Topic
                        </Label>
                        <Combobox
                          options={topics}
                          placeholder="Type or select a topic"
                          selected={selectedTopic}
                          onSelect={setSelectedTopic}
                          allowCustom={true}
                        />
                      </div>
                     

                      <div className="grid gap-2">
                        <Label htmlFor="numQuestions">Number of Questions</Label>
                        <Select value={numQuestions.toString()} onValueChange={(v) => setNumQuestions(Number(v))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select number of questions" />
                          </SelectTrigger>
                          <SelectContent>
                            {[5, 10, 15, 20].map(num => (
                              <SelectItem key={num} value={num.toString()}>{num} Questions</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="questionType">Question Type</Label>
                        <Select value={questionType} onValueChange={setQuestionType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select question type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mcq">Multiple Choice Questions</SelectItem>
                            <SelectItem value="cq">Comprehension Questions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button onClick={handleGenerateQuiz}>Generate Quiz</Button>
                    </CardContent>
                  </Card>
                  </>
                  )}

                  {/* Create Exam */}
                  {generatedQuestions.length > 0 && (
                    <Card className="border border-teal-200 shadow-md bg-white/70 backdrop-blur-md rounded-2xl">
                      <CardContent className="p-6 space-y-6">
                        <div className="space-y-2">
                          <h2 className="text-2xl font-semibold text-teal-700">📝 Create Exam</h2>
                          <p className="text-sm text-muted-foreground">Finalize your quiz and prepare for the exam.</p>
                        </div>

                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="examName">Exam Name</Label>
                            <Input id="examName" value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="Enter exam name" />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="examDescription">Exam Description</Label>
                            <Textarea id="examDescription" value={examDescription} onChange={(e) => setExamDescription(e.target.value)} placeholder="Enter exam description" />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="tags">Tags</Label>
                            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. midterm, chapter-1, easy" />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="duration">Exam Duration (minutes)</Label>
                            <Input id="duration" type="number" value={duration || ''} onChange={(e) => setDuration(Number(e.target.value))} placeholder="Enter duration in minutes" />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="schedule">Schedule Exam</Label>
                            <Input id="schedule" type="datetime-local" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                          </div>

                          <Button variant="outline" onClick={() => console.log("Preview Exam", { examName, examDescription, tags, duration, scheduleTime })}>
                            Preview Exam
                          </Button>

                          <Button onClick={handleCreateExam} className="w-full">Create Exam</Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Panel */}
                <div className="w-full lg:w-[45%] space-y-6 max-h-[85vh] overflow-y-auto pr-2">
                  {generatedQuestions.length > 0 ? (
                    <>
                      <div>
                        <h2 className="text-3xl font-bold text-teal-700">📚 Generated Questions</h2>
                        <p className="text-sm text-muted-foreground">
                          Select the questions you wish to include in the exam. Each question includes options and the correct answer.
                        </p>
                      </div>

                      <Card>
                        <CardContent className="p-6 space-y-6">
                          {generatedQuestions.map((question, idx) => (
                            <div key={question.id} className="flex items-start gap-4 border-b pb-4">
                              <input
                                type="checkbox"
                                className="mt-2"
                                checked={selectedQuestions.includes(question.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedQuestions([...selectedQuestions, question.id]);
                                  } else {
                                    setSelectedQuestions(selectedQuestions.filter(id => id !== question.id));
                                  }
                                }}
                              />
                              <div className="space-y-2">
                                <p className="font-semibold text-gray-800">
                                  Q{idx + 1}: {question.question}
                                </p>
                                {question.type === 'mcq' && question.options && (
                                  <div className="ml-4 space-y-1 text-sm">
                                    {question.options.map((option, index) => (
                                      <div key={index} className="flex items-center">
                                        <span>{option}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <p className="text-sm text-green-700 font-medium">
                                  ✅ Correct Answer: {question.correctAnswer}
                                </p>
                                {question.explanation && (
                                  <p className="text-sm text-gray-600 italic">
                                    Explanation: {question.explanation}
                                  </p>
                                )}
                                <p className="text-sm text-gray-500">Difficulty: {question.difficulty}</p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                   
                    <div className="flex items-center justify-center h-full">
                      
                    </div>)}
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
