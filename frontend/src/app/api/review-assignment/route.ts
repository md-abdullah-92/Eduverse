// app/api/review-assignment/route.ts
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
    const { title, description, answer } = await req.json();

    if (!title || !description || !answer) {
      return NextResponse.json(
        { error: "Missing assignment or answer data." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
   const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are Eduverse AI, a helpful assistant that evaluates student responses to academic assignments. 
Review and fairly score the student's answer based on the provided assignment. 
Provide only a numeric score out of 100, with no additional comments unless asked explicitly.

Assignment Title: ${title}

Assignment Description:
${description}

Student's Answer:
${answer}

Please evaluate this answer and respond with only the numeric score out of 100.`;

    let retries = 0;
    let delay = RETRY_DELAY_BASE;

    while (retries < MAX_RETRIES) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawText = response.text();

        const extractedMark = extractNumericMark(rawText);
        if (extractedMark === null) {
          throw new Error("Failed to extract mark from Gemini response.");
        }

        return NextResponse.json({ mark: extractedMark });
      } catch (error: any) {
        if (error.status === 503) {
          console.warn(`Gemini API overload. Retrying (${retries + 1}/${MAX_RETRIES})...`);
          await sleep(delay);
          delay *= RETRY_DELAY_MULTIPLIER;
          retries++;
          continue;
        }
        console.error("Error evaluating assignment:", error);
        return NextResponse.json(
          { error: "An error occurred while evaluating the assignment." },
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
