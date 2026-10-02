import { NextRequest, NextResponse } from "next/server";
import { sleep } from "@/utils/sleep";
import { generateWithGroq } from "@/lib/groq";

// Retry config
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;
const RETRY_DELAY_MULTIPLIER = 2;

type GroqError = Error & { status?: number };

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
          const text = await generateWithGroq([
            { role: "user", content: prompt },
          ]);

          console.log(`Groq raw response for CQ ID ${id}:`, text);

          const extractedMark = parseFloat(text.match(/\d+(\.\d+)?/)?.[0] || "NaN");

          if (!isNaN(extractedMark)) {
            mark = Math.min(5, Math.max(0, extractedMark)); // Clamp between 0–5
            break;
          } else {
            throw new Error("Invalid mark format returned by Groq");
          }
        } catch (error: unknown) {
          const err = error as GroqError;

          if (err.status === 503) {
            console.warn(`Groq API overload. Retrying (${retries + 1}/${MAX_RETRIES})...`);
            await sleep(delay);
            delay *= RETRY_DELAY_MULTIPLIER;
            retries++;
          } else {
            console.error(`Error evaluating CQ ID ${id}:`, err);
            break;
          }
        }
      }

      totalCQMarks += mark;
      console.log(`CQ ID ${id} evaluated. Mark: ${mark}`);
    }

    return NextResponse.json({ totalCQMarks });
  } catch (err: unknown) {
    console.error("CQ Review Error:", err);
    return NextResponse.json({ error: "Failed to review CQ answers" }, { status: 500 });
  }
}
