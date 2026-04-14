import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { type, messages, classContent, className, testDate, customPrompt, flashcardCount, quizDifficulty, quizLength } = await req.json();

  let systemPrompt = '';
  let userMessage = '';
  const maxChars = 12000;

  if (type === 'chat') {
    systemPrompt = `You are an AI study assistant for "${className}". Help students learn using the provided material. Be clear, concise, and student-friendly. Include examples when helpful.`;
    userMessage = `STUDY MATERIAL:\n${classContent.slice(0, maxChars)}\n\nCHAT HISTORY:\n${messages.slice(-10).map((m: any) => `${m.role}: ${m.content}`).join('\n')}\n\nUser's question:`;
  } else if (type === 'notes') {
    systemPrompt = `You are an expert academic note-taker. Create comprehensive, well-organized study notes with clear headings, bullet points, and key concepts highlighted. Use markdown formatting. Include definitions, formulas, and examples where relevant.`;
    userMessage = `Create detailed study notes for "${className}" (around 2000 words) from this material:\n\n${classContent.slice(0, maxChars)}`;
  } else if (type === 'flashcards') {
    const count = flashcardCount || 10;
    systemPrompt = `You are a expert at creating study flashcards. Generate exactly ${count} flashcards testing key concepts. Return ONLY a valid JSON array with no markdown, no explanations. Each card must have "front" (question) and "back" (answer). Example: [{"front":"What is X?","back":"Y"}]`;
    userMessage = `Generate ${count} flashcards for "${className}". Focus on definitions, formulas, key concepts, and important facts from this material:\n\n${classContent.slice(0, maxChars)}\n\nIMPORTANT: Return ONLY valid JSON array like: [{"front":"question","back":"answer"},{"front":"question","back":"answer"}]`;
  } else if (type === 'quiz') {
    const length = quizLength || 5;
    const difficulty = quizDifficulty || 'medium';
    const difficultyInstructions = difficulty === 'easy' ? 'Basic recall questions with straightforward answers' : difficulty === 'hard' ? 'Complex questions requiring analysis and deep understanding' : 'Questions testing understanding and application';
    systemPrompt = `You are a quiz generator. Create ${length} multiple choice ${difficulty} questions. Return ONLY valid JSON array with no markdown. Each question: {"question":"...","options":["A","B","C","D"],"correct":0-3,"explanation":"..."}`;
    userMessage = `Generate ${length} ${difficulty} quiz questions for "${className}". ${difficultyInstructions}. Return ONLY valid JSON:\n[{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"..."}] from:\n${classContent.slice(0, maxChars)}`;
  } else if (type === 'studyplan') {
    systemPrompt = `You are a study planner. Create a practical day-by-day study schedule. Use clear day headers and specific topics to cover each day.`;
    userMessage = `Create a comprehensive study plan for "${className}"${testDate ? ` with exam on ${testDate}` : ''}. Include specific topics, study sessions, and review periods.\n\nMaterial:\n${classContent.slice(0, 6000)}`;
  } else if (type === 'podcast') {
    systemPrompt = `You are converting study material into an engaging podcast script. Make it conversational, fun, and easy to understand. Use a host/guest dialogue format.`;
    userMessage = `Create a 2-3 minute podcast script (host explains to student) about key concepts in "${className}". Focus on the most important points:\n${classContent.slice(0, 6000)}`;
  } else if (type === 'summary') {
    systemPrompt = `You are a study summarizer. Create a concise summary that captures the essence of the material in bullet points.`;
    userMessage = `Summarize the key points of "${className}" (under 500 words):\n\n${classContent.slice(0, maxChars)}`;
  } else if (type === 'custom' && customPrompt) {
    systemPrompt = customPrompt;
    userMessage = `Based on this material for "${className}":\n\n${classContent.slice(0, maxChars)}`;
  }

  const fullContent = type === 'chat' ? userMessage : `${systemPrompt}\n\n${userMessage}`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('No GEMINI_API_KEY found');
      return NextResponse.json({ error: 'AI not configured. Add GEMINI_API_KEY to Vercel.' }, { status: 500 });
    }

    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullContent }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: type === 'notes' ? 4000 : 2048,
          responseMimeType: 'text/plain',
        },
      }),
    });

    const data = await response.json();
    
    console.log('AI response status:', response.status);
    
    if (!response.ok) {
      console.error('Gemini API error:', JSON.stringify(data).slice(0, 300));
      return NextResponse.json({ error: data.error?.message || 'AI request failed', status: response.status });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text || text.trim().length === 0) {
      console.error('Empty AI response');
      return NextResponse.json({ error: 'Empty response from AI. Try again with shorter content.' }, { status: 500 });
    }

    return NextResponse.json({ text: text.trim() });
  } catch (err: any) {
    console.error('AI route error:', err);
    return NextResponse.json({ error: err.message || 'Failed to connect to AI' }, { status: 500 });
  }
}