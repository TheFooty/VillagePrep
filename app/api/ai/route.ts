import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { type, messages, classContent, className, testDate } = await req.json();

  let systemPrompt = '';
  let userMessage = '';

  if (type === 'chat') {
    systemPrompt = `You are an AI exam prep coach for "${className}" at The Village School. Help students study using ONLY the class material below. You can generate flashcards, quizzes, summaries, and explanations — always grounded in this content. Be clear and student-friendly.\n\nCLASS MATERIAL:\n${classContent}`;
  } else if (type === 'flashcards') {
    systemPrompt = `You are an exam prep coach. Generate exactly 8 flashcards from the class material. Respond ONLY with a valid JSON array, no preamble, no markdown fences, no explanation. Format: [{"front": "question here", "back": "answer here"}]`;
    userMessage = `Generate 8 flashcards for "${className}" from this material:\n${classContent.slice(0, 4000)}`;
  } else if (type === 'quiz') {
    systemPrompt = `You are an exam prep coach. Generate exactly 5 multiple choice questions from the class material. Respond ONLY with a valid JSON array, no preamble, no markdown, no explanation. Format: [{"question": "...", "options": ["option A", "option B", "option C", "option D"], "correct": 0, "explanation": "..."}] where correct is the 0-based index of the correct answer.`;
    userMessage = `Generate 5 multiple choice questions for "${className}" from this material:\n${classContent.slice(0, 4000)}`;
  } else if (type === 'studyplan') {
    systemPrompt = `You are an exam prep coach. Create a practical day-by-day study plan based on the actual topics in the class material. Be specific to the content — name the actual topics. Use plain text, no markdown.`;
    userMessage = `Create a study plan for "${className}"${testDate ? ` with a test on ${testDate}` : ''}.\n\nMaterial:\n${classContent.slice(0, 3000)}`;
  }

  const apiMessages = type === 'chat'
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }];

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://villageprep.com',
        'X-Title': 'VillagePrep',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: apiMessages,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'Something went wrong. Please try again.';
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ text: 'Error connecting to AI. Please try again.' }, { status: 500 });
  }
}