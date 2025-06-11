import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { sleep } from "@/utils/sleep";

const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;
const RETRY_DELAY_MULTIPLIER = 2;

export async function POST(req: Request) {
  try {
    const { topic, numQuestions, questionType } = await req.json();

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Invalid topic input." },
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
              text: "You are Eduverse Assistant, a helpful and friendly chatbot for creating educational quizzes. Generate questions that are challenging yet fair, with clear and concise answers."
            }
          ]
        }
      ]
    });

    const prompt = `You are a helpful quiz generator. Generate ${numQuestions} ${questionType} questions about "${topic}". For MCQ questions, provide 4 options (A, B, C, D) with clear explanations for the correct answer. For CQ questions, provide detailed answers. Format the output as JSON with the following structure:
    {
      "questions": [
        {
          "id": "${Math.random().toString(36).substring(2, 15)}",
          "question": "question_text",
          "type": "${questionType}",
          "options": ["option1", "option2", "option3", "option4"], // Only for MCQ
          "correctAnswer": "option_letter", // Only for MCQ
          "explanation": "answer_explanation(Not so long)",// For both MCQ and CQ
          "difficulty": "easy|medium|hard"
        }
      ]
    }

    Please respond ONLY with the JSON object. Do not include any additional text or explanations. Use double quotes for all keys and values.`;

    let retries = 0;
    let delay = RETRY_DELAY_BASE;

    while (retries < MAX_RETRIES) {
      try {
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const markdown = response.text();
        
        // Clean up the response by removing any text before and after the JSON
        const cleanedResponse = markdown.trim();
        const jsonStart = cleanedResponse.indexOf('{');
        const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;
        
        if (jsonStart === -1 || jsonEnd === 0) {
          throw new Error('No JSON found in response');
        }

        const jsonStr = cleanedResponse.substring(jsonStart, jsonEnd);
        
        try {
          // Parse the JSON response
          const quizData = JSON.parse(jsonStr);
          
          // Validate the structure
          if (!quizData.questions || !Array.isArray(quizData.questions)) {
            throw new Error('Invalid questions array');
          }

          // Generate unique IDs for each question
          const questions = quizData.questions.map((q: any) => ({
            ...q,
            id: Math.random().toString(36).substring(2, 15)
          }));

          return NextResponse.json({ quiz: { questions } });
        } catch (parseError) {
          console.error('Failed to parse JSON:', parseError);
          console.log('Cleaned response:', cleanedResponse);
          console.log('Extracted JSON:', jsonStr);
          
          // If parsing fails, try to extract questions directly
          if (questionType === 'mcq') {
            const mcqPattern = /\d+\.\s+(.*?)\n[A-D]\.\s+(.*?)\n/g;
            const matches = [...cleanedResponse.matchAll(mcqPattern)];
            
            if (matches.length > 0) {
              const questions = matches.map((match, index) => ({
                id: Math.random().toString(36).substring(2, 15),
                question: match[1],
                type: 'mcq',
                options: ['A', 'B', 'C', 'D'].map(letter => 
                  cleanedResponse.split(`\n${letter}.`)[1].split('\n')[0].trim()
                ),
                correctAnswer: 'A', // Default to A, can be updated later
                explanation: '',
                difficulty: 'medium'
              }));
              
              return NextResponse.json({ quiz: { questions } });
            }
          }
          
          throw new Error('Invalid JSON format in response');
        }
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
      { error: "Failed to generate quiz after multiple attempts" },
      { status: 500 }
    );

  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}