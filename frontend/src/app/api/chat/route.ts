import { NextResponse } from "next/server";
import { generateWithGroq } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json({ reply: "Invalid message input." }, { status: 400 });
    }

    const text = await generateWithGroq([
      {
        role: "system",
        content: "You are Eduverse Assistant, a helpful and friendly chatbot for students and teachers.",
      },
      { role: "user", content: userMessage },
    ]);

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Groq API error:", error);
    return NextResponse.json({ reply: "Server error contacting Groq assistant." }, { status: 500 });
  }
}
