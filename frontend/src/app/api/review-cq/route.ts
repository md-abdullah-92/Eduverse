import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { cqAnswers } = await req.json();

    if (!cqAnswers || !Array.isArray(cqAnswers)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let totalCQMarks = 0;

    for (const item of cqAnswers) {
      const { id, answer } = item;

      // Dummy placeholder for the question — replace with actual question if needed
      const questionText = "Replace this with the actual CQ question text based on ID";

      console.log("Received question:", questionText);
      console.log("Received answer:", answer);

      const prompt = `Evaluate the student's answer to the following question. Give a mark out of 5 only.

Question: ${questionText}
Answer: ${answer}

Give only the mark (0-5) as the result.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      const mark = parseFloat(text);

      if (!isNaN(mark)) {
        totalCQMarks += mark;
      }
    }

    return NextResponse.json({ totalCQMarks });
  } catch (err) {
    console.error("CQ Review Error:", err);
    return NextResponse.json({ error: "Failed to review CQ answers" }, { status: 500 });
  }
}
