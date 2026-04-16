import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface CacheEntry {
  response: string;
  timestamp: number;
}

const responseCache = new Map<string, CacheEntry>();
const CACHE_TTL = 24 * 60 * 60 * 1000;
const MAX_CACHE_SIZE = 500;

function getCacheKey(prompt: string): string {
  return prompt.slice(0, 150).toLowerCase().trim();
}

function getCachedResponse(key: string): { text: string; cached: boolean } | null {
  const entry = responseCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return { text: entry.response, cached: true };
  }
  responseCache.delete(key);
  return null;
}

function setCachedResponse(key: string, response: string): void {
  if (responseCache.size >= MAX_CACHE_SIZE) {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    for (const [k, v] of responseCache) {
      if (v.timestamp < oldestTime) {
        oldestTime = v.timestamp;
        oldestKey = k;
      }
    }
    if (oldestKey) responseCache.delete(oldestKey);
  }
  responseCache.set(key, { response, timestamp: Date.now() });
}

async function* generateStream(prompt: string): AsyncGenerator<string> {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) {
    yield '[Error: COHERE_API_KEY not configured]';
    return;
  }

  const url = 'https://api.cohere.com/v1/chat';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Client-Name': 'VillagePrep'
      },
      body: JSON.stringify({
        model: 'command-r7b',
        message: prompt,
        temperature: 0.7,
        max_tokens: 2048,
        stream: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const err = await res.text();
      yield `[Error: ${res.status} - ${err.slice(0, 100)}]`;
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      yield '[Error: No response body]';
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const text = json.text || json.message?.content;
            if (text) yield text;
          } catch {
            // Skip non-JSON lines
          }
        }
      }
    }
  } catch (err) {
    yield `[Error: ${err instanceof Error ? err.message : 'Request failed'}]`;
  }
}

function buildSystemPrompt(type: string, opts: {
  className: string;
  testDate?: string;
  flashcardCount?: number;
  quizDifficulty?: string;
  quizLength?: number;
}): string {
  const { className, testDate, flashcardCount, quizDifficulty, quizLength } = opts;

  switch (type) {
    case 'chat':
      return `You are an AI study assistant for "${className}". Help students learn. Be clear, concise, student-friendly.`;
    case 'notes':
      return `Create comprehensive study notes with headings, bullet points, key concepts. Use markdown.`;
    case 'flashcards':
      return `Generate exactly ${flashcardCount || 10} flashcards. JSON only: [{"front":"Q","back":"A"}]`;
    case 'quiz':
      const diff = quizDifficulty || 'medium';
      const len = quizLength || 5;
      const diffTxt = diff === 'easy' ? 'Basic recall' : diff === 'hard' ? 'Complex analysis' : 'Understanding';
      return `Create ${len} ${diff} questions. ${diffTxt}. JSON: [{"question":"?","options":["A","B","C","D"],"correct":0,"explanation":"?"}]`;
    case 'studyplan':
      return `Create day-by-day study schedule.${testDate ? ` Exam: ${testDate}` : ''}`;
    case 'podcast':
      return `Create 2-3 min podcast script. Host/guest dialogue.`;
    case 'summary':
      return `Summarize key points in bullet points (<500 words).`;
    default:
      return `Help students learn "${className}".`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type = 'chat',
      messages = [],
      classContent = '',
      className = 'General Study',
      testDate,
      customPrompt,
      flashcardCount = 10,
      quizDifficulty = 'medium',
      quizLength = 5,
      stream = false,
    } = body;

    const maxChars = type === 'chat' ? 16000 : 12000;
    const content = classContent?.slice(0, maxChars * 2) || '';

    let userMsg = '';

    if (type === 'chat') {
      const hist = messages.slice(-10).map((m: ChatMessage) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n\n');
      userMsg = `STUDY MATERIAL:\n${content.slice(0, maxChars)}\n\nCHAT HISTORY:\n${hist}\n\nQuestion:`;
    } else if (type === 'notes') {
      userMsg = `Create study notes (~2000 words) for "${className}":\n\n${content.slice(0, maxChars)}`;
    } else if (type === 'flashcards') {
      userMsg = `Generate ${flashcardCount} flashcards for "${className}".\n\nMaterial:\n${content.slice(0, maxChars)}\n\nJSON: [{"front":"?","back":"?"}]`;
    } else if (type === 'quiz') {
      userMsg = `Generate ${quizLength} ${quizDifficulty} quiz questions for "${className}".\n\nMaterial:\n${content.slice(0, maxChars)}\n\nJSON: [{"question":"?","options":["A","B","C","D"],"correct":0,"explanation":"?"}]`;
    } else if (type === 'studyplan') {
      userMsg = `Create study plan for "${className}"${testDate ? ` (exam ${testDate})` : ''}.\n\nMaterial:\n${content.slice(0, 6000)}`;
    } else if (type === 'podcast') {
      userMsg = `Create 2-3 min podcast about "${className}".\n\nMaterial:\n${content.slice(0, 6000)}`;
    } else if (type === 'summary') {
      userMsg = `Summarize "${className}" (<500 words):\n\n${content.slice(0, maxChars)}`;
    } else if (type === 'custom' && customPrompt) {
      userMsg = `${customPrompt}\n\nMaterial:\n${content.slice(0, maxChars)}`;
    }

    if (!userMsg) {
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(type, { className, testDate, flashcardCount, quizDifficulty, quizLength });
    const fullPrompt = `${systemPrompt}\n\n${userMsg}`;

    const cacheKey = `${type}:${className}:${userMsg.slice(0, 200)}`;
    
    if (!stream) {
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        return NextResponse.json({ text: cached.text, cached: true });
      }

      let fullResponse = '';
      for await (const chunk of generateStream(fullPrompt)) {
        fullResponse += chunk;
      }

      if (fullResponse) {
        setCachedResponse(cacheKey, fullResponse);
      }

      return NextResponse.json({ text: fullResponse });
    }

    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of generateStream(fullPrompt)) {
            controller.enqueue(`data: ${JSON.stringify({ text: chunk })}\n\n`);
          }
          controller.enqueue('data: [DONE]\n\n');
        } catch (err) {
          controller.enqueue(`data: ${JSON.stringify({ error: err instanceof Error ? err.message : 'Error' })}\n\n`);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'AI request failed';
    console.error('AI route error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}