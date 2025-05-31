import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json({ reply: "Invalid message input." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            { text: "You are Eduverse Assistant, a helpful and friendly chatbot for students and teachers." },
          ],
        },
      ],
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({ reply: "Server error contacting Gemini assistant." }, { status: 500 });
  }
}
