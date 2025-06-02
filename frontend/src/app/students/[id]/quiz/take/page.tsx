'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { QuizQuestion } from "@/types/quiz";

interface ExamProps {
  params: {
    id: string;
  };
}

export default function TakeExamPage({ params }: ExamProps) {
  const [examData, setExamData] = useState<{
    name: string;
    description: string;
    questions: QuizQuestion[];
    totalMarks: number;
  } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch exam data on mount
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Here you would fetch the exam data from your backend
        // For now, let's simulate with a sample exam
        const sampleExam = {
          name: "Sample Exam",
          description: "This is a sample exam",
          questions: [],
          totalMarks: 0
        };
        
        setExamData(sampleExam);
        setLoading(false);
      } catch (err) {
        setError('Failed to load exam data');
        setLoading(false);
      }
    };

    fetchExam();
  }, [params.id]);

  // Handle question index validation
  useEffect(() => {
    if (currentQuestionIndex >= (examData?.questions?.length || 0)) {
      setCurrentQuestionIndex(0);
    }
  }, [currentQuestionIndex, examData?.questions?.length]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!examData) {
    return null;
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < examData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Last question, calculate score
      calculateScore();
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    examData.questions.forEach(question => {
      if (question.type === 'mcq' && answers[question.id] === question.correctAnswer) {
        totalScore++;
      }
    });
    setScore(totalScore);
  };

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Exam Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">{examData.name}</h2>
                <p className="text-muted-foreground">{examData.description}</p>
              </div>
              <div>
                <p className="text-3xl font-bold">Your Score: {score}/{examData.totalMarks}</p>
              </div>
              <Button onClick={handleRetake}>
                Retake Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Add null checks for current question
  const currentQuestion = examData.questions[currentQuestionIndex] || {
    id: '',
    question: '',
    type: 'mcq',
    options: [],
    correctAnswer: '',
    explanation: '',
    difficulty: 'medium'
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{examData.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-muted-foreground">{examData.description}</p>
            <div className="space-y-4">
              <h3>Question {currentQuestionIndex + 1} of {examData.questions.length}</h3>
              <p className="font-medium">{currentQuestion.question}</p>
              {currentQuestion.type === 'mcq' ? (
                <div className="space-y-2">
                  {currentQuestion.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={String.fromCharCode(65 + index)} // Converts index to A, B, C, D
                        checked={answers[currentQuestion.id] === String.fromCharCode(65 + index)}
                        onChange={() => handleAnswerChange(currentQuestion.id, String.fromCharCode(65 + index))}
                      />
                      <label>{String.fromCharCode(65 + index)}. {option}</label>
                    </div>
                  ))}
                </div>
              ) : (
                <Textarea
                  placeholder="Enter your answer..."
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                />
              )}
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex === examData.questions.length - 1 ? 'Submit Exam' : 'Next Question'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{exam.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-muted-foreground">{exam.description}</p>
            <div className="space-y-4">
              <h3>Question {currentQuestionIndex + 1} of {exam.questions.length}</h3>
              <p className="font-medium">{currentQuestion.question}</p>
              {currentQuestion.type === 'mcq' ? (
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map((option, index) => (
                    <div key={option} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option}
                        checked={answers[currentQuestion.id] === option}
                        onChange={() => handleAnswerChange(currentQuestion.id, option)}
                      />
                      <label>{option}. {currentQuestion.options[index]}</label>
                    </div>
                  ))}
                </div>
              ) : (
                <Textarea
                  placeholder="Enter your answer..."
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                />
              )}
              <Button onClick={handleNextQuestion}>
                {currentQuestionIndex === exam.questions.length - 1 ? 'Submit Exam' : 'Next Question'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
