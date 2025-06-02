import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sleep } from "@/utils/sleep";

const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second
const RETRY_DELAY_MULTIPLIER = 2;

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { markdown: "", error: "Invalid topic input." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: "You are Eduverse Assistant, a helpful and friendly chatbot for students and teachers. Provide content that is formal, clearly organized, and suitable for students in a classroom setting.",
            },
          ],
        },
      ],
    });

    const prompt = `Generate a formal study note for students in a classroom setting based on the topic: "${topic}". Use clear headings and bullet points. The tone should be academic and student-friendly. Do not include any markdown code.`;

    let retries = 0;
    let delay = RETRY_DELAY_BASE;

    while (retries < MAX_RETRIES) {
      try {
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const markdown = response.text();
        return NextResponse.json({ markdown });
      } catch (error: any) {
        if (error.status === 503) {
          console.warn(`Gemini API overload. Retrying (${retries + 1}/${MAX_RETRIES})...`);
          await sleep(delay);
          delay *= RETRY_DELAY_MULTIPLIER;
          retries++;
          continue;
        }
        throw error;
      }
    }

    return NextResponse.json(
      { markdown: "", error: "Gemini API is currently overloaded. Please try again later." },
      { status: 503 }
    );
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { markdown: "", error: "Server error contacting Gemini assistant." },
      { status: 500 }
    );
  }
}
