'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseStreamingAIProps {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

export function useStreamingAI({ onChunk, onComplete, onError }: UseStreamingAIProps = {}) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const streamResponse = useCallback(
    async (body: object) => {
      // Abort any ongoing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      setIsStreaming(true);
      setStreamedText('');
      
      try {
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, stream: true }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          
          if (done || !isMountedRef.current) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                onComplete?.(fullText);
                setIsStreaming(false);
                return fullText;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullText += parsed.text;
                  setStreamedText(fullText);
                  onChunk?.(parsed.text);
                }
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch {
                // Handle non-JSON data (plain text chunks)
                if (data && data !== '[DONE]') {
                  fullText += data;
                  setStreamedText(fullText);
                  onChunk?.(data);
                }
              }
            }
          }
        }

        if (isMountedRef.current) {
          onComplete?.(fullText);
        }
        return fullText;
      } catch (error) {
        if (!isMountedRef.current) {
          return null;
        }
        
        if (error instanceof Error && error.name === 'AbortError') {
          return null;
        }
        onError?.(error as Error);
        throw error;
      } finally {
        if (isMountedRef.current) {
          setIsStreaming(false);
        }
        abortControllerRef.current = null;
      }
    },
    [onChunk, onComplete, onError]
  );

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  return {
    streamResponse,
    abort,
    isStreaming,
    streamedText,
  };
}
