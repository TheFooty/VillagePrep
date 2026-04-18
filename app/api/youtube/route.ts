import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: 'YouTube URL required' }, { status: 400 });
    }

if (typeof url !== 'string' || url.length > 500) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);

    if (!videoIdMatch) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const videoId = videoIdMatch[1];

    if (!videoId || videoId.length !== 11) {
      return NextResponse.json({ error: 'Invalid YouTube video ID' }, { status: 400 });
    }
    
    let transcript: { start: number; duration: number; text: string }[] = [];
    
    try {
      const { fetchTranscript } = await import('youtube-transcript');
      transcript = await fetchTranscript(videoId);
    } catch {
      // Transcript fetch failed, try fallback
    }
    
    if (!transcript || transcript.length === 0) {
      try {
        const proxyRes = await fetch(`https://youtubetranscript.com/api/v1/transcript/${videoId}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        
        if (proxyRes.ok) {
          const xmlText = await proxyRes.text();
          const jsonText = xmlText
            .replace(/<text start="([^"]+)" duration="([^"]+)">/g, '{"start":$1,"duration":$2,"text":"')
            .replace(/<\/text>/g, '"}')
            .replace(/\n/g, '')
            .replace(/\[.*?\]/g, '')
            .replace(/\{"/g, '{"')
            .replace(/"\}/g, '"}')
            .replace(/},\{"start/g, ',{"start');
          
          const matches = jsonText.match(/\{[^}]+\}/g) || [];
          transcript = matches.map((m: string) => {
            try {
              return JSON.parse(m);
            } catch {
              return null;
            }
          }).filter(Boolean);
        }
      } catch {
        // Fallback also failed
      }
    }

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ 
        error: 'This video does not have captions available. Try a different video or upload a file instead.' 
      }, { status: 400 });
    }

const fullText = transcript.map((t) => t.text).join(' ');

    if (!fullText.trim()) {
      return NextResponse.json({ error: 'No text content found in transcript' }, { status: 400 });
    }

    return NextResponse.json({
      text: fullText,
      videoId,
      hasTranscript: true
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to get transcript';
    console.error('YouTube transcript error:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
