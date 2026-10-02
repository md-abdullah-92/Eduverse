import { NextResponse } from "next/server";
import { sleep } from "@/utils/sleep";
import { generateWithGroq } from "@/lib/groq";

const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;
const RETRY_DELAY_MULTIPLIER = 2;

interface QuizQuestion {
  id: string;
  question: string;
  type: "mcq" | "cq";
  options?: string[];
  correctAnswer?: string;
  answerLetter?: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

function normalizeGeneratedQuestion(q: any, questionType: string): QuizQuestion {
  if (questionType === "mcq") {
    const baseOptions = Array.isArray(q.options)
      ? q.options.map((opt: unknown) => String(opt).trim()).filter(Boolean)
      : [];

    const options = [...baseOptions.slice(0, 4)];
    while (options.length < 4) {
      options.push(`Option ${options.length + 1}`);
    }

    const validLetters = ["A", "B", "C", "D"];
    const rawAnswer = String(
      q.correctAnswer ?? q.correct_answer ?? q.answer_letter ?? q.answerLetter ?? "A"
    ).trim();
    const answerValue = rawAnswer.toUpperCase();

    let answerLetter = validLetters[0];
    let correctAnswer = options[0] || "Option 1";

    if (validLetters.includes(answerValue)) {
      answerLetter = answerValue;
      correctAnswer = options[validLetters.indexOf(answerLetter)] ?? options[0] ?? "Option 1";
    } else {
      const matchingIndex = options.findIndex(
        (opt) => opt.toLowerCase() === rawAnswer.toLowerCase()
      );
      if (matchingIndex >= 0) {
        answerLetter = validLetters[matchingIndex] ?? validLetters[0];
        correctAnswer = options[matchingIndex] ?? options[0] ?? "Option 1";
      }
    }

    return {
      id: Math.random().toString(36).substring(2, 15),
      question: String(q.question || "Untitled question").trim(),
      type: "mcq",
      options: options.slice(0, 4),
      correctAnswer,
      answerLetter,
      explanation: String(q.explanation || "The correct answer is supported by the source material.").trim(),
      difficulty: ["easy", "medium", "hard"].includes(String(q.difficulty || "medium").toLowerCase())
        ? (String(q.difficulty || "medium").toLowerCase() as "easy" | "medium" | "hard")
        : "medium",
    };
  }

  return {
    id: Math.random().toString(36).substring(2, 15),
    question: String(q.question || "Untitled question").trim(),
    type: "cq",
    explanation: String(q.explanation || "Answer based on the provided content.").trim(),
    difficulty: ["easy", "medium", "hard"].includes(String(q.difficulty || "medium").toLowerCase())
      ? (String(q.difficulty || "medium").toLowerCase() as "easy" | "medium" | "hard")
      : "medium",
  };
}

export async function POST(req: Request) {
  try {
    const { topic, numQuestions, questionType } = await req.json();

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Invalid topic input." },
        { status: 400 }
      );
    }

    const prompt = `You are a helpful quiz generator. Generate ${numQuestions} ${questionType} questions about "${topic}". For MCQ questions, provide 4 options (A, B, C, D) with clear explanations for the correct answer. For CQ questions, provide detailed answers. Format the output as JSON with the following structure:
    {
      "questions": [
        {
          "id": "random_id",
          "question": "question_text",
          "type": "${questionType}",
          "options": ["option1", "option2", "option3", "option4"], // Only for MCQ
          "correctAnswer": "option_letter", // Only for MCQ
          "explanation": "answer_explanation(Not so long)", // For both MCQ and CQ
          "difficulty": "easy|medium|hard"
        }
      ]
    }

    Please respond ONLY with the JSON object. Do not include any additional text or explanations. Use double quotes for all keys and values.`;

    let retries = 0;
    let delay = RETRY_DELAY_BASE;

    while (retries < MAX_RETRIES) {
      try {
        const markdown = await generateWithGroq([
          {
            role: "system",
            content: "You are Eduverse Assistant, a helpful and friendly chatbot for creating educational quizzes. Generate questions that are challenging yet fair, with clear and concise answers.",
          },
          { role: "user", content: prompt },
        ]);

        const cleanedResponse = markdown.trim();
        const jsonStart = cleanedResponse.indexOf('{');
        const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;

        if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error('No JSON found in response');
        }

        const jsonStr = cleanedResponse.substring(jsonStart, jsonEnd);

        try {
          const quizData = JSON.parse(jsonStr);

          if (!quizData.questions || !Array.isArray(quizData.questions)) {
            throw new Error('Invalid questions array');
          }

          const questions: QuizQuestion[] = quizData.questions.map((q: any) =>
            normalizeGeneratedQuestion(q, questionType)
          );

          return NextResponse.json({ quiz: { questions } });
        } catch (parseError) {
          console.error('Failed to parse JSON:', parseError);
          console.log('Cleaned response:', cleanedResponse);
          console.log('Extracted JSON:', jsonStr);

          if (questionType === 'mcq') {
            const mcqPattern = /\d+\.\s+(.*?)\nA\.\s+(.*?)\nB\.\s+(.*?)\nC\.\s+(.*?)\nD\.\s+(.*?)\n?/g;
            const matches = [...cleanedResponse.matchAll(mcqPattern)];

            if (matches.length > 0) {
              const questions: QuizQuestion[] = matches.map((match) => ({
                id: Math.random().toString(36).substring(2, 15),
                question: match[1].trim(),
                type: "mcq",
                options: [match[2], match[3], match[4], match[5]].map((opt) => opt.trim()),
                correctAnswer: "A", // Default
                explanation: "",
                difficulty: "medium"
              }));

              return NextResponse.json({ quiz: { questions } });
            }
          }

          throw new Error('Invalid JSON format in response');
        }
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "status" in error &&
          typeof (error as { status?: number }).status === "number"
        ) {
          const status = (error as { status: number }).status;
          if (status === 503) {
            console.warn(`Groq API overload. Retrying (${retries + 1}/${MAX_RETRIES})...`);
            await sleep(delay);
            delay *= RETRY_DELAY_MULTIPLIER;
            retries++;
            continue;
          }
        }

        throw error;
      }
    }

    return NextResponse.json(
      { error: "Failed to generate quiz after multiple attempts" },
      { status: 500 }
    );

  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
