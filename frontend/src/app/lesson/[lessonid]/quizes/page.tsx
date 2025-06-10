"use client";

import { useEffect, useState } from "react";
import {  useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { dmSerif, notoSerif } from "@/utils/font";
import { CheckCircle, Circle } from "lucide-react";
import { useRef } from "react";


type Question = {
  id: string;
  question: string;
  type: "mcq" | "text";
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
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const answersRef = useRef<Record<string, string>>({});


  const lessonId = useParams().lessonid as string;


  useEffect(() => {
    async function fetchNote() {
      try {
        const res = await fetch(`http://localhost:5001/api/quizes/lesson/${lessonId}`);
        const data = await res.json();
        setQuestions(data[0]?.questions || []);
        setDuration(data[0]?.duration || 0);
        setDescription(data[0]?.description || '');
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
      setStartDelay(prev => {
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

  const handleChange = (questionId: string, selectedLetter: string) => {
  const newAnswers = { ...answersRef.current, [questionId]: selectedLetter };
  answersRef.current = newAnswers;
  setAnswers(newAnswers);
};


  const handleSubmit = () => {
  if (submitted) return;

  let total = 0;
  questions.forEach(q => {
    if (
      answersRef.current[q.id]?.trim().toUpperCase() ===
      q.correctAnswer?.trim().toUpperCase()
    ) {
      total++;
    }
  });

  setScore(total);
  setSubmitted(true);
};

  

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" + sec : sec}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className={`${dmSerif.className} text-3xl text-teal-800 font-bold`}>
            🧠 Take Your Exam
          </h1>
          <p className="text-gray-600 text-lg">
            Answer all questions within the given time.
          </p>
        </div>

        {/* Exam Description */}
        {!hasStarted && !submitted && !loading && (
          <Card className="bg-white/90 border shadow-lg rounded-2xl">
            <CardContent className="p-6 space-y-3">
              <h2 className="text-xl text-teal-700 font-semibold">📋 Exam Description</h2>
              <p className="text-gray-700">{description}</p>
            </CardContent>
          </Card>
        )}

        {/* Countdown */}
        {!hasStarted && !submitted && (
          <div className="text-center text-xl font-medium text-teal-700">
            ⏳ Your exam starts in <span className="font-bold">{startDelay}</span> seconds...
          </div>
        )}

        {/* Timer */}
        {hasStarted && !submitted && (
          <div className="text-right text-sm font-medium text-teal-700">
            ⏱️ Time Left: <span className="font-bold">{formatTime(remainingTime)}</span>
            <Progress
              className="mt-1 h-2"
              value={((duration * 60 - remainingTime) / (duration * 60)) * 100}
            />
          </div>
        )}

        {/* Questions */}
        {hasStarted && (
          <div className="space-y-8">
            {questions.map((q, index) => {
              const userAnswer = answers[q.id];
              return (
                <Card key={q.id} className="bg-white border shadow-md rounded-2xl">
                  <CardContent className="p-6 space-y-4">
                    {/* Question Title */}
                    <div className="flex gap-3 items-start">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-purple-600 text-purple-700 font-bold">
                        {index + 1}
                      </div>
                      <div className={`${notoSerif.className} text-lg text-gray-800`}>
                        {q.question}
                      </div>
                    </div>

               



{q.options?.map((opt, i) => {
  const optionLetter = String.fromCharCode(65 + i);
  const isSelected = userAnswer === optionLetter;
  const isCorrect = q.correctAnswer === optionLetter;

  return (
    <div
      key={i}
      className={`flex items-start gap-3 p-4 rounded-xl border text-sm md:text-base
        ${
          submitted && isCorrect
            ? "bg-green-50 border-green-500"
            : "bg-white border-gray-300 hover:border-teal-500"
        } transition-all cursor-pointer`}
      onClick={() => !submitted && handleChange(q.id, optionLetter)}
    >
      <div className="pt-1">
        {isSelected ? (
          <CheckCircle className="text-teal-600 w-5 h-5" />
        ) : (
          <Circle className="text-gray-400 w-5 h-5" />
        )}
      </div>
      <div>
        <span className="font-semibold text-gray-800">{optionLetter}.</span>{" "}
        <span className="text-gray-700">{opt}</span>
        {submitted && isSelected && !isCorrect && (
          <span className="text-red-500 ml-2">❌</span>
        )}
      </div>
    </div>
  );
})}


                    {/* Explanation */}
                    {submitted && (
                      <div className="pl-12 space-y-2 text-sm text-gray-700">
                        <div className="text-green-700 font-medium">
                          ✅ Correct Answer: {q.correctAnswer}
                        </div>
                        {q.explanation && (
                          <div>💡 <strong>Explanation:</strong> {q.explanation}</div>
                        )}
                        <div className="text-gray-500">Difficulty: {q.difficulty}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Submit Button */}
        {hasStarted && !submitted && (
          <div className="text-center">
            <Button className="mt-6" onClick={handleSubmit}>
              Submit Answers
            </Button>
          </div>
        )}

        {/* Result Card */}
        {submitted && (
          <Card className="bg-white border border-teal-200 shadow-lg rounded-2xl mt-8 text-center">
            <CardContent className="p-6 space-y-3">
              <h2 className={`${dmSerif.className} text-2xl text-teal-800 font-semibold`}>
                🎉 Exam Submitted!
              </h2>
              <p className="text-gray-700 font-medium">
                You answered {score} out of {questions.length} questions correctly.
              </p>
              <p className="text-sm text-gray-600">
                Redirecting you to the summary page shortly...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
