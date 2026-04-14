import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { type, messages, classContent, className, testDate, customPrompt } = await req.json();

  let systemPrompt = '';
  let userMessage = '';

  if (type === 'chat') {
    systemPrompt = `You are an AI study assistant for "${className}". Help students learn using the provided material. Be clear, concise, and student-friendly. Include examples when helpful.`;
  } else if (type === 'notes') {
    systemPrompt = `You are an expert note-taker and study guide. Create comprehensive, well-organized notes. Use headings, bullet points, and highlight key concepts.`;
    userMessage = `Create detailed study notes for "${className}" from this material:\n\n${classContent.slice(0, 8000)}`;
  } else if (type === 'flashcards') {
    systemPrompt = `You are an expert at creating study flashcards. Generate exactly 10 flashcards. Respond ONLY with valid JSON array. Format: [{"front": "question", "back": "answer"}]`;
    userMessage = `Generate 10 flashcards for "${className}" from this material:\n${classContent.slice(0, 4000)}`;
  } else if (type === 'quiz') {
    systemPrompt = `You are a quiz generator. Create exactly 5 multiple choice questions. Respond ONLY with valid JSON array. Format: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "..."}]`;
    userMessage = `Generate 5 quiz questions for "${className}" from this material:\n${classContent.slice(0, 4000)}`;
  } else if (type === 'studyplan') {
    systemPrompt = `You are a study planner. Create a practical day-by-day study plan.`;
    userMessage = `Create a study plan for "${className}"${testDate ? ` with exam on ${testDate}` : ''}.\n\nMaterial:\n${classContent.slice(0, 3000)}`;
  } else if (type === 'podcast') {
    systemPrompt = `You are converting study material into an engaging podcast script. Make it conversational and fun.`;
    userMessage = `Create a podcast script (2-3 minutes) for "${className}". Focus on key points:\n\n${classContent.slice(0, 3000)}`;
  } else if (type === 'summary') {
    systemPrompt = `You are a study summarizer. Create a concise summary. Use bullet points.`;
    userMessage = `Summarize "${className}":\n\n${classContent.slice(0, 4000)}`;
  } else if (type === 'custom' && customPrompt) {
    systemPrompt = customPrompt;
    userMessage = `Based on this material for "${className}":\n\n${classContent.slice(0, 5000)}`;
  }

  const fullContent = type === 'chat' 
    ? `STUDY MATERIAL:\n${classContent}\n\n${messages.map((m: any) => `${m.role}: ${m.content}`).join('\n')}`
    : `${systemPrompt}\n\n${userMessage}`;

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key configured. Add GEMINI_API_KEY to Vercel env vars.' }, { status: 500 });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullContent }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: type === 'notes' ? 3000 : 1500,
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini error:', JSON.stringify(data).slice(0, 500));
      return NextResponse.json({ error: data.error?.message || 'AI failed', status: 500 });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      return NextResponse.json({ error: 'Empty response from AI', status: 500 });
    }

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error('AI error:', err);
    return NextResponse.json({ error: err.message || 'Failed to connect to AI' }, { status: 500 });
  }
}