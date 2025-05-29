import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json({ reply: "Invalid message input." }, { status: 400 });
    }


    // Construct endpoint
    const endpoint = `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_ID}/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`;

    // Prompt format for instruct models
    const systemPrompt = "You are Eduverse Assistant, a helpful and friendly chatbot for students and teachers.";
    const fullPrompt = `${systemPrompt}\nUser: ${userMessage}\nAssistant:`;

    // Call Azure OpenAI
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_OPENAI_KEY as string,
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        max_tokens: 300,
        temperature: 0.7,
        stop: ["User:", "Assistant:"],
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("Azure OpenAI error:", {
        status: response.status,
        statusText: response.statusText,
        body: text,
      });
      return NextResponse.json({ reply: "Assistant error. Check Azure settings." }, { status: 500 });
    }

    const data = JSON.parse(text);
    const reply = data.choices?.[0]?.text?.trim() ?? "Sorry, I didn’t get that.";
    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ reply: "Server error contacting assistant." }, { status: 500 });
  }
}
