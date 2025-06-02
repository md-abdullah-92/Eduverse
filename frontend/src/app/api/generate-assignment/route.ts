import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sleep } from "@/utils/sleep";
import { m } from "framer-motion";

const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;
const RETRY_DELAY_MULTIPLIER = 2;

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { assignment: "", error: "Invalid topic input." },
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
              text: "You are Eduverse Assistant, a helpful AI for teachers and students. You create academic assignments that are creative, multi-dimensional, and classroom-friendly.",
            },
          ],
        },
      ],
    });

    const prompt = `Create a detailed classroom assignment based on the topic: "${topic}".Keep the tone formal and academic. Do not use markdown codes.`;

    let retries = 0;
    let delay = RETRY_DELAY_BASE;

    while (retries < MAX_RETRIES) {
      try {
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const assignment = response.text();
        
        return NextResponse.json({ markdown: assignment });
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
      { assignment: "", error: "Gemini API is currently overloaded. Please try again later." },
      { status: 503 }
    );
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { assignment: "", error: "Server error contacting Gemini assistant." },
      { status: 500 }
    );
  }
}
