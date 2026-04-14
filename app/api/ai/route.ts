import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { type, messages, classContent, className, testDate, customPrompt } = await req.json();

  let systemPrompt = '';
  let userMessage = '';

  if (type === 'chat') {
    systemPrompt = `You are an AI study assistant for "${className}". Help students learn using the provided material. Be clear, concise, and student-friendly. Include examples when helpful.\n\nSTUDY MATERIAL:\n${classContent}`;
  } else if (type === 'notes') {
    systemPrompt = `You are an expert note-taker and study guide. Create comprehensive, well-organized notes from the provided material. Use headings, bullet points, and highlight key concepts. Include formulas, definitions, and important details.\n\nFormat with:\n- Clear headings for each topic\n- Bullet points for main ideas\n- Bold for key terms\n- Examples where relevant\n- Tables for comparisons if useful`;
    userMessage = `Create detailed study notes for "${className}" from this material:\n\n${classContent.slice(0, 8000)}`;
  } else if (type === 'flashcards') {
    systemPrompt = `You are an expert at creating study flashcards. Generate exactly 10 flashcards that test understanding of key concepts. Respond ONLY with a valid JSON array, no preamble, no markdown fences.\n\nFormat: [{"front": "question", "back": "answer"}]`;
    userMessage = `Generate 10 flashcards for "${className}" from this material:\n${classContent.slice(0, 4000)}`;
  } else if (type === 'quiz') {
    systemPrompt = `You are a quiz generator. Create exactly 5 multiple choice questions that test deep understanding. Respond ONLY with valid JSON array, no markdown.\n\nFormat: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "..."}]`;
    userMessage = `Generate 5 quiz questions for "${className}" from this material:\n${classContent.slice(0, 4000)}`;
  } else if (type === 'studyplan') {
    systemPrompt = `You are a study planner. Create a practical day-by-day study plan. Be specific to actual topics in the material. Use plain text.`;
    userMessage = `Create a study plan for "${className}"${testDate ? ` with exam on ${testDate}` : ''}.\n\nMaterial:\n${classContent.slice(0, 3000)}`;
  } else if (type === 'podcast') {
    systemPrompt = `You are converting study material into an engaging podcast script. Make it conversational, fun, and easy to understand. The host is explaining to a student.\n\nUse:\n- Short sentences for easy listening\n- Examples and analogies\n- A friendly, encouraging tone`;
    userMessage = `Create a podcast script (2-3 minutes) explaining the key concepts of "${className}". Focus on the most important points:\n\n${classContent.slice(0, 3000)}`;
  } else if (type === 'summary') {
    systemPrompt = `You are a study summarizer. Create a concise summary that captures the essence of the material. Use bullet points and keep it under 300 words.`;
    userMessage = `Summarize the key points of "${className}" in a concise way:\n\n${classContent.slice(0, 4000)}`;
  } else if (type === 'custom' && customPrompt) {
    systemPrompt = customPrompt;
    userMessage = `Based on this material for "${className}":\n\n${classContent.slice(0, 5000)}`;
  }

  const apiMessages = type === 'chat'
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }];

  try {
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('Missing OPENROUTER_API_KEY');
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://villageprep.com',
        'X-Title': 'VillagePrep',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: apiMessages,
        max_tokens: type === 'notes' ? 3000 : 1500,
      }),
    });

    const data = await response.json();
    console.log('AI response status:', response.status);
    if (!response.ok) {
      console.log('AI error response:', JSON.stringify(data).slice(0, 300));
      return NextResponse.json({ error: data.error?.message || `HTTP ${response.status}` }, { status: response.status });
    }
    
    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }
    
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      return NextResponse.json({ error: 'Empty response from AI' }, { status: 500 });
    }
    return NextResponse.json({ text });
} catch (err: any) {
    console.error('AI error:', err);
    return NextResponse.json({ error: err.message || 'Failed to connect to AI' }, { status: 500 });
  }
}
