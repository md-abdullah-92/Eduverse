"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { robotoSlab, raleway } from "@/utils/font";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

export default function StudentExamPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [startDelay, setStartDelay] = useState(10);
  const [hasStarted, setHasStarted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const sampleQuestions = [
      {
        id: "1",
        question: "What is the capital of France?",
        type: "mcq",
        options: ["Berlin", "Madrid", "Paris", "Lisbon"],
        correctAnswer: "Paris",
      },
      {
        id: "2",
        question: "Which language runs in a web browser?",
        type: "mcq",
        options: ["Java", "C", "Python", "JavaScript"],
        correctAnswer: "JavaScript",
      },
      {
        id: "3",
        question: "What does CSS stand for?",
        type: "mcq",
        options: [
          "Central Style Sheets",
          "Cascading Style Sheets",
          "Cascading Simple Sheets",
          "Cars SUVs Sailboats",
        ],
        correctAnswer: "Cascading Style Sheets",
      },
      {
        id: "4",
        question: "What year was JavaScript launched?",
        type: "mcq",
        options: ["1996", "1995", "1994", "None of the above"],
        correctAnswer: "1995",
      },
      {
        id: "5",
        question: "Which HTML tag is used to define an internal style sheet?",
        type: "mcq",
        options: ["<style>", "<script>", "<css>", "<link>"],
        correctAnswer: "<style>",
      },
      {
        id: "6",
        question: "Which company developed the React library?",
        type: "mcq",
        options: ["Google", "Facebook", "Microsoft", "Twitter"],
        correctAnswer: "Facebook",
      },
      {
        id: "7",
        question: "What does SQL stand for?",
        type: "mcq",
        options: [
          "Stylish Question Language",
          "Stylesheet Query Language",
          "Statement Question Language",
          "Structured Query Language",
        ],
        correctAnswer: "Structured Query Language",
      },
    ];
    setQuestions(sampleQuestions);
    setDuration(5);
    setStartDelay(10);
  }, []);

  useEffect(() => {
    if (submitted || hasStarted) return;

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
  }, [duration, submitted, hasStarted]);

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

  const handleChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    if (submitted) return;

    let total = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) total++;
    });

    setScore(total);
    setSubmitted(true);

    setTimeout(() => {
      router.push("/exam/summary");
    }, 5000);
  };

  const formatTime = seconds => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" + sec : sec}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className={`${robotoSlab.className} text-3xl text-teal-800 font-bold`}>🧠 Take Your Exam</h1>
          <p className="text-gray-600">Answer the following questions within the given time.</p>
        </div>

        {!hasStarted && !submitted && (
          <div className="text-center text-lg font-semibold text-teal-800">
            🚀 Your exam will start in <span className="font-bold">{startDelay}</span> seconds...
          </div>
        )}

        {hasStarted && !submitted && (
          <div className="text-right text-sm font-medium text-teal-700">
            ⏱️ Time Left: <span className="font-bold">{formatTime(remainingTime)}</span>
            <Progress className="mt-1 h-2" value={((duration * 60 - remainingTime) / (duration * 60)) * 100} />
          </div>
        )}

        {hasStarted && (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <Card key={q.id} className="bg-white border border-gray-200 shadow rounded-2xl">
                <CardContent className="p-5 space-y-3">
                  <p className={`${raleway.className} font-semibold text-gray-800`}>Q{idx + 1}. {q.question}</p>
                  {q.type === "mcq" && q.options && (
                    <div className="ml-4 space-y-2">
                      {q.options.map((opt, i) => (
                        <label key={i} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            disabled={submitted}
                            checked={answers[q.id] === opt}
                            onChange={() => handleChange(q.id, opt)}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {submitted && (
                    <div className="text-sm text-green-700">
                      ✅ Correct Answer: {q.correctAnswer}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {hasStarted && !submitted && (
          <div className="text-center">
            <Button className="mt-6" onClick={handleSubmit}>Submit Answers</Button>
          </div>
        )}

        {submitted && (
          <div className="mt-8 bg-white border border-teal-200 p-6 rounded-2xl text-center space-y-3 shadow">
            <h2 className={`${robotoSlab.className} text-2xl text-teal-800 font-semibold`}>🎉 Exam Submitted!</h2>
            <p className="text-gray-700 font-medium">You answered {score} out of {questions.length} questions correctly.</p>
            <p className="text-sm text-gray-600">Review your answers above. Redirecting you to the summary page...</p>
          </div>
        )}
      </div>
    </div>
  );
}
