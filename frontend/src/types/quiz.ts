export interface QuizQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'cq';
  options?: string[]; // Only for MCQ
  correctAnswer?: string; // Only for MCQ
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Exam {
  id: string;
  name: string;
  description: string;
  questions: QuizQuestion[];
  totalMarks: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExamResult {
  examId: string;
  studentId: string;
  score: number;
  totalMarks: number;
  answers: Record<string, string>; // questionId: selectedAnswer
  createdAt: string;
}
