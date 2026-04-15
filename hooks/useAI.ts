import { useState, useCallback, useRef } from 'react';

export interface AIRequest {
  type: string;
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  classContent: string;
  className: string;
  testDate?: string;
  customPrompt?: string;
  flashcardCount?: number;
  quizDifficulty?: string;
  quizLength?: number;
  stream?: boolean;
}

export interface AIResponse {
  text: string;
  cached?: boolean;
}

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (request: AIRequest): Promise<AIResponse | null> => {
    setLoading(true);
    setError(null);

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Request failed');
      }

      const data = await response.json() as AIResponse;
      setLoading(false);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed';
      setError(message);
      setLoading(false);
      return null;
    }
  }, []);

  const stream = useCallback(async function* (
    request: Omit<AIRequest, 'stream'>
  ): AsyncGenerator<string> {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, stream: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Request failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream');
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
            if (data === '[DONE]') {
              setLoading(false);
              return;
            }
            try {
              const json = JSON.parse(data);
              if (json.text) yield json.text;
            } catch {
              // Skip non-JSON
            }
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stream failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const abort = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setLoading(false);
  }, []);

  return {
    generate,
    stream,
    abort,
    loading,
    error,
    clearError: () => setError(null),
  };
}