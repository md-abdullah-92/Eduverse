"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { dmSerif, notoSerif } from "@/utils/font";
import { Award, CheckCircle, Circle, ClipboardList } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ChatWidget from "../../ChatWidget";

type Question = {
  id: string;
  question: string;
  type: "mcq" | "cq";
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
};

export default function StudentExamPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startDelay, setStartDelay] = useState(10);
  const [hasStarted, setHasStarted] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const answersRef = useRef<Record<string, string>>({});
  const courseId = localStorage.getItem("courseId") || "";
  const studentId = localStorage.getItem("userId") || "";
  const [title, setTitle] = useState("Quiz");
  console.log("Course ID:", courseId);
  console.log("Student ID:", studentId);
  const lessonId = useParams().lessonid as string;
  const Id = parseInt(lessonId, 10);
  let fullmark = 0;
  questions.forEach((q) => {
    if (q.type === "cq") {
      fullmark += 5; // Assuming each CQ is worth 5 points
    } else if (q.type === "mcq") {
      fullmark += 1; // Assuming each MCQ is worth 1 point
    }
  });

  useEffect(() => {
    async function fetchNote() {
      try {
        const res = await fetch(
          `http://localhost:5001/api/quizes/lesson/${lessonId}`
        );
        const data = await res.json();
        setTitle(data[0]?.title || "Quiz");
        setQuestions(data[0]?.questions || []);
        setDuration(data[0]?.duration || 0);
        setDescription(data[0]?.description || "");
      } catch (err) {
        alert("Failed to fetch questions. Please try again later.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchNote();
  }, [lessonId]);

  useEffect(() => {
    if (submitted || hasStarted || loading) return;

    const delayInterval = setInterval(() => {
      setStartDelay((prev) => {
        if (prev <= 1) {
          clearInterval(delayInterval);
          const start = new Date();
          setStartTime(start);
          setRemainingTime(duration * 60);
          setHasStarted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(delayInterval);
  }, [duration, submitted, hasStarted, loading]);

  useEffect(() => {
    if (!startTime || submitted) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      const remaining = duration * 60 - elapsed;
      if (remaining <= 0) {
        clearInterval(interval);
        handleSubmit();
      } else {
        setRemainingTime(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, submitted]);

  const handleChange = (questionId: string, value: string) => {
    const newAnswers = { ...answersRef.current, [questionId]: value };
    answersRef.current = newAnswers;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (submitted) return;

    let total = 0;
    const cqAnswers: { id: string; question: string; answer: string }[] = [];

    questions.forEach((q) => {
      const userAns = answersRef.current[q.id]?.trim();
      if (q.type === "mcq") {
        if (userAns?.toUpperCase() === q.correctAnswer?.toUpperCase()) total++;
      } else if (q.type === "cq") {
        cqAnswers.push({
          id: q.id,
          question: q.question,
          answer: userAns || "",
        });
      }
    });

    let cqMarks = 0;

    try {
      if (cqAnswers.length > 0) {
        const res = await fetch("/api/review-cq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cqAnswers }),
        });

        const result = await res.json();
        cqMarks =
          typeof result.totalCQMarks === "number" ? result.totalCQMarks : 0;
      }
    } catch (error) {
      console.error("CQ Evaluation Error:", error);
      alert("Failed to evaluate CQ answers.");
    }

    const finalScore = total + cqMarks;
    const quizScore = (finalScore / fullmark) * 100;
    setScore(quizScore);
    setSubmitted(true);

    const answeredquestions = questions.map((q) => ({
      question: q.question,
      correctAnswer: q.correctAnswer || null,
      options: q.options || [],
      explanation: q.explanation || null,
      difficulty: q.difficulty || "medium",
      type: q.type,
      useranswer: answersRef.current[q.id] || "",
    }));

    try {
      await fetch("http://localhost:5000/api/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          marks: quizScore,
          studentId: parseInt(studentId),
          fullmark: fullmark,
          lessonId: Id,
          courseId: parseInt(courseId),
          answeredquestions,
        }),
      });
    } catch (err) {
      console.error("Failed to save result:", err);
      alert("Something went wrong while submitting results.");
    }
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" + sec : sec}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-10">
        {!submitted && (
          <div className="text-center space-y-2">
            <h1
              className={`${dmSerif.className} text-3xl text-gray-800 font-bold flex items-center justify-center gap-2`}
            >
              <ClipboardList className="w-7 h-7 text-teal-600" />
              Take Your Exam
            </h1>
            <p className="text-gray-600">MCQs: 1pt each · CQs: 5pts each.</p>
          </div>
        )}

        {submitted && (
          <Card className="bg-white border border-teal-200 shadow-lg rounded-2xl mt-8 text-center">
            <CardContent className="p-6 space-y-3">
              <h2
                className={`${dmSerif.className} text-2xl text-teal-800 font-semibold flex items-center justify-center gap-2`}
              >
                <Award className="w-6 h-6 text-green-600" />
                Exam Submitted!
              </h2>
              <p className="text-gray-700 font-medium">
                Your total score: <strong>{score}</strong>
              </p>
            </CardContent>
            <ChatWidget />
          </Card>
        )}

        {!hasStarted && !submitted && !loading && (
          <Card className="bg-white/90 border shadow-lg rounded-2xl">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-xl text-teal-700 font-semibold">
                📋 Exam Description
              </h2>
              <p className="text-gray-700">{description}</p>
            </CardContent>
          </Card>
        )}

        {!hasStarted && !submitted && (
          <div className="text-center text-xl font-medium text-teal-700">
            ⏳ Your exam starts in{" "}
            <span className="font-bold">{startDelay}</span> seconds...
          </div>
        )}

        {hasStarted && !submitted && (
          <div className="text-right text-sm font-medium text-teal-700">
            ⏱️ Time Left:{" "}
            <span className="font-bold">{formatTime(remainingTime)}</span>
            <Progress
              className="mt-1 h-2"
              value={((duration * 60 - remainingTime) / (duration * 60)) * 100}
            />
          </div>
        )}

        {hasStarted && (
          <div className="space-y-8">
            {questions.map((q, index) => {
              const userAnswer = answers[q.id];
              return (
                <Card
                  key={q.id}
                  className="bg-white border shadow-md rounded-2xl"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-3 items-start">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-purple-600 text-purple-700 font-bold">
                        {index + 1}
                      </div>
                      <div
                        className={`${notoSerif.className} text-lg text-gray-800`}
                      >
                        {q.question}
                      </div>
                    </div>

                    {q.type === "mcq" &&
                      q.options?.map((opt, i) => {
                        const optionLetter = String.fromCharCode(65 + i);
                        const isSelected = userAnswer === optionLetter;
                        const isCorrect = q.correctAnswer === optionLetter;

                        return (
                          <div
                            key={i}
                            className={`flex items-start gap-3 p-4 rounded-xl border text-sm md:text-base ${
                              submitted && isCorrect
                                ? "bg-green-50 border-green-500"
                                : "bg-white border-gray-300 hover:border-teal-500"
                            } transition-all cursor-pointer`}
                            onClick={() =>
                              !submitted && handleChange(q.id, optionLetter)
                            }
                          >
                            <div className="pt-1">
                              {isSelected ? (
                                <CheckCircle className="text-teal-600 w-5 h-5" />
                              ) : (
                                <Circle className="text-gray-400 w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800">
                                {optionLetter}.
                              </span>{" "}
                              <span className="text-gray-700">{opt}</span>
                              {submitted && isSelected && !isCorrect && (
                                <span className="text-red-500 ml-2">❌</span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                    {q.type !== "mcq" && (
                      <textarea
                        disabled={submitted}
                        rows={6}
                        className="w-full border border-gray-300 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800 mt-3"
                        placeholder="Write your answer here..."
                        value={userAnswer || ""}
                        onChange={(e) => handleChange(q.id, e.target.value)}
                      />
                    )}

                    {submitted && (
                      <div className="pl-12 space-y-2 text-sm text-gray-700">
                        {q.type === "mcq" && (
                          <div className="text-green-700 font-medium">
                            ✅ Correct Answer: {q.correctAnswer}
                          </div>
                        )}
                        {q.explanation && (
                          <div>
                            💡 <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                        <div className="text-gray-500">
                          Difficulty: {q.difficulty}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {hasStarted && !submitted && (
          <div className="text-center">
            <Button className="mt-6" onClick={handleSubmit}>
              Submit Answers
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
