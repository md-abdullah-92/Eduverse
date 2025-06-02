'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { QuizQuestion } from "@/types/quiz";
import { shuffle } from "lodash";

export default function QuizManagementPage() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionType, setQuestionType] = useState("mcq");
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [examName, setExamName] = useState("");
  const [examDescription, setExamDescription] = useState("");

  const handleGenerateQuiz = async () => {
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          numQuestions,
          questionType,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedQuestions(data.quiz.questions);
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Failed to generate quiz. Please try again.');
    }
  };

  const handleCreateExam = async () => {
    if (!examName || !examDescription || selectedQuestions.length === 0) {
      alert('Please fill in all required fields and select at least one question.');
      return;
    }

    try {
      const examData = {
        name: examName,
        description: examDescription,
        questions: generatedQuestions.filter(q => selectedQuestions.includes(q.id)),
        totalMarks: selectedQuestions.length,
      };

      // Here you would typically send this data to your backend to create the exam
      console.log('Creating exam:', examData);
      alert('Exam created successfully!');
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('Failed to create exam. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Quiz Generation Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter quiz topic"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="numQuestions">Number of Questions</Label>
                <Select
                  value={numQuestions.toString()}
                  onValueChange={(value) => setNumQuestions(Number(value))}
                >
                  <SelectTrigger>
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
              <div className="grid gap-2">
                <Label htmlFor="questionType">Question Type</Label>
                <Select
                  value={questionType}
                  onValueChange={setQuestionType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice Questions</SelectItem>
                    <SelectItem value="cq">Comprehension Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleGenerateQuiz}>
                Generate Quiz
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Questions Section */}
        {generatedQuestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedQuestions.map((question) => (
                  <div key={question.id} className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(question.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedQuestions([...selectedQuestions, question.id]);
                        } else {
                          setSelectedQuestions(
                            selectedQuestions.filter(id => id !== question.id)
                          );
                        }
                      }}
                    />
                    <div>
                      <p className="font-medium">{question.question}</p>
                      {question.type === 'mcq' && (
                        <div className="mt-2 space-y-1">
                          {['A', 'B', 'C', 'D'].map((option, index) => (
                            <p key={option}>
                              {option}. {question.options[index]}
                            </p>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 text-sm text-muted-foreground">Difficulty: {question.difficulty}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Exam Section */}
        <Card>
          <CardHeader>
            <CardTitle>Create Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="examName">Exam Name</Label>
                <Input
                  id="examName"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="Enter exam name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="examDescription">Exam Description</Label>
                <Textarea
                  id="examDescription"
                  value={examDescription}
                  onChange={(e) => setExamDescription(e.target.value)}
                  placeholder="Enter exam description"
                />
              </div>
              <Button onClick={handleCreateExam}>
                Create Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
