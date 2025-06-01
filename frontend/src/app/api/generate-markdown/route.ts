import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ markdown: "", error: "Invalid topic input." }, { status: 400 });
    }

    // Initialize the Gemini client with your API key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Start a chat conversation with the model
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

    // Compose prompt to generate markdown slide content
    const prompt = `Generate a well-structured markdown document for a teaching slide on the topic: "${topic}". Include headers, bullet points and you should not any markdown code.`;

    // Send prompt to Gemini chat model
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const markdown = response.text();

    return NextResponse.json({ markdown });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { markdown: "", error: "Server error contacting Gemini assistant." },
      { status: 500 }
    );
  }
}
