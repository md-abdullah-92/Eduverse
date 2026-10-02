type GroqMessage = {
  role: "system" | "user";
  content: string;
};

type GroqError = Error & { status?: number };

export async function generateWithGroq(messages: GroqMessage[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      messages,
      temperature: 1,
      max_completion_tokens: 2048,
      top_p: 1,
      reasoning_effort: process.env.GROQ_REASONING_EFFORT || "medium",
    }),
  });

  if (!response.ok) {
    const error = new Error(`Groq API request failed with status ${response.status}`) as GroqError;
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Groq returned an empty response.");
  }

  return text.trim();
}