import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sleep } from "@/utils/sleep";

// Retry config
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;
const RETRY_DELAY_MULTIPLIER = 2;

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(req: NextRequest) {
  try {
    const { cqAnswers } = await req.json();

    if (!cqAnswers || !Array.isArray(cqAnswers)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    let totalCQMarks = 0;

    for (const item of cqAnswers) {
      const { id, answer, question } = item;
      console.log("Processing CQ entry:", item);

      if (!answer || typeof answer !== "string" || !question) {
        console.warn("Skipping invalid CQ entry:", item);
        continue;
      }

      const prompt = `Evaluate the student's answer to the following question. Give a mark out of 5 only.

Question: ${question}
Answer: ${answer}

Respond ONLY with a number (0–5), no explanation or extra text.`;

      let retries = 0;
      let delay = RETRY_DELAY_BASE;
      let mark = 0;

      while (retries < MAX_RETRIES) {
        try {
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text().trim();

          console.log(`Gemini raw response for CQ ID ${id}:`, text);

          const extractedMark = parseFloat(text.match(/\d+(\.\d+)?/)?.[0] || "NaN");

          if (!isNaN(extractedMark)) {
            mark = Math.min(5, Math.max(0, extractedMark)); // Clamp between 0–5
            break;
          } else {
            throw new Error("Invalid mark format returned by Gemini");
          }
        } catch (error: any) {
          if (error.status === 503) {
            console.warn(`Gemini API overload. Retrying (${retries + 1}/${MAX_RETRIES})...`);
            await sleep(delay);
            delay *= RETRY_DELAY_MULTIPLIER;
            retries++;
          } else {
            console.error(`Error evaluating CQ ID ${id}:`, error);
            break;
          }
        }
      }

      totalCQMarks += mark;
      console.log(`CQ ID ${id} evaluated. Mark: ${mark}`);
    }

    return NextResponse.json({ totalCQMarks });
  } catch (err) {
    console.error("CQ Review Error:", err);
    return NextResponse.json({ error: "Failed to review CQ answers" }, { status: 500 });
  }
}
