import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp|heic|heif)$/)) {
      return NextResponse.json({ 
        error: 'Image files cannot be parsed. Please use PDF, TXT, MD, CSV, or DOCX files instead.' 
      }, { status: 400 });
    }
    
    if (!fileName.match(/\.(pdf|txt|md|csv|docx)$/)) {
      return NextResponse.json({ 
        error: 'Unsupported file type. Please use PDF, TXT, MD, CSV, or DOCX files.' 
      }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let extractedText = '';

    if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.csv')) {
      extractedText = buffer.toString('utf-8');
    } else if (fileName.endsWith('.docx')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (fileName.endsWith('.pdf')) {
      return NextResponse.json({ 
        error: 'PDF parsing is temporarily unavailable. Please convert your PDF to DOCX format and try again.' 
      }, { status: 400 });
    }

    if (!extractedText || !extractedText.trim()) {
      return NextResponse.json({ error: 'No text could be extracted from the file.' }, { status: 400 });
    }

    return NextResponse.json({ text: extractedText.trim() });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unable to parse file';
    console.error('File parse error:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
