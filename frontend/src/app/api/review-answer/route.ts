// app/api/review-answer/route.ts
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sleep } from "@/utils/sleep";

const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;
const RETRY_DELAY_MULTIPLIER = 2;

function extractNumericMark(text: string): number | null {
  const match = text.match(/(\d{1,3})/);
  if (match) {
    const value = parseInt(match[1]);
    if (value >= 0 && value <= 100) {
      return value;
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const { question, answer } = await req.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Missing question or answer." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are Eduverse AI, a helpful assistant that evaluates student responses to academic questions.
Evaluate the student's answer based on the following question. 

Return two things:
1. A numeric score out of 10.
2. A short constructive suggestion (1-2 lines) on how to improve the answer.

Question:
${question}

Student's Answer:
${answer}

Respond with:
Score: <numeric_score>/10
Suggestion: <short_feedback>
`;

    let retries = 0;
    let delay = RETRY_DELAY_BASE;

    while (retries < MAX_RETRIES) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawText = await response.text();

        const mark = extractNumericMark(rawText);
        const suggestionMatch = rawText.match(/Suggestion:\s*(.+)/i);
        const suggestion = suggestionMatch ? suggestionMatch[1].trim() : "No suggestion found.";

        if (mark === null) {
          throw new Error("Failed to extract mark from Gemini response.");
        }

        return NextResponse.json({ mark, suggestion });
      } catch (error: unknown) {
        if (
          typeof error === "object" &&
          error !== null &&
          "status" in error &&
          typeof (error as { status: number }).status === "number" &&
          (error as { status: number }).status === 503
        ) {
          console.warn(`Gemini API overload. Retrying (${retries + 1}/${MAX_RETRIES})...`);
          await sleep(delay);
          delay *= RETRY_DELAY_MULTIPLIER;
          retries++;
          continue;
        }

        console.error("Error evaluating answer:", error);
        return NextResponse.json(
          { error: "An error occurred while evaluating the answer." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Gemini API is currently unavailable after multiple retries." },
      { status: 503 }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Invalid request or internal server error." },
      { status: 500 }
    );
  }
}
