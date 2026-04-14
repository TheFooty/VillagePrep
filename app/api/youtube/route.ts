import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    
    if (!url) {
      return NextResponse.json({ error: 'YouTube URL required' }, { status: 400 });
    }

    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    
    if (!videoIdMatch) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const videoId = videoIdMatch[1];
    
    const { fetchTranscript } = await import('youtube-transcript');
    const transcript = await fetchTranscript(videoId);
    
    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ error: 'No transcript available for this video' }, { status: 400 });
    }

    const fullText = transcript.map(t => t.text).join(' ');
    
    return NextResponse.json({ 
      text: fullText,
      videoId,
      hasTranscript: true
    });
  } catch (err: any) {
    console.error('YouTube transcript error:', err);
    return NextResponse.json({ error: err.message || 'Failed to get transcript' }, { status: 500 });
  }
}
