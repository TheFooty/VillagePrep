import { useState, useCallback, useRef, useEffect } from 'react';

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
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, []);

  const generate = useCallback(async (request: AIRequest): Promise<AIResponse | null> => {
    // Abort any ongoing request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Request failed');
      }

      const data = await response.json() as AIResponse;
      
      if (!isMountedRef.current) {
        return null;
      }
      
      setLoading(false);
      return data;
    } catch (err) {
      if (!isMountedRef.current) {
        return null;
      }
      
      const message = err instanceof Error ? err.message : 'Request failed';
      setError(message);
      setLoading(false);
      return null;
    }
  }, []);

  const stream = useCallback(async function* (
    request: Omit<AIRequest, 'stream'>
  ): AsyncGenerator<string> {
    // Abort any ongoing request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, stream: true }),
        signal: abortRef.current.signal,
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
        
        if (done || !isMountedRef.current) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
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
      if (!isMountedRef.current) {
        return;
      }
      const message = err instanceof Error ? err.message : 'Stream failed';
      setError(message);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
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
