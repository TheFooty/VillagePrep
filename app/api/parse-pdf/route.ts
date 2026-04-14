import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let extractedText = '';

    // Image files - use OCR
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)) {
      const { createWorker } = await import('tesseract.js');
      
      const worker = await createWorker('eng');
      
      // Create a Blob from the buffer
      const blob = new Blob([new Uint8Array(arrayBuffer)], { type: file.type || 'image/png' });
      const result = await worker.recognize(blob);
      extractedText = result.data.text;
      
      await worker.terminate();
    }
    // PDF files - disabled due to Vercel compatibility
    else if (fileName.endsWith('.pdf')) {
      return NextResponse.json({ 
        error: 'PDF parsing is temporarily unavailable. Please convert your PDF to DOCX format and try again.' 
      }, { status: 400 });
    }
    // Text files
    else if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.csv')) {
      extractedText = buffer.toString('utf-8');
    }
    // DOCX files
    else if (fileName.endsWith('.docx')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    }
    else {
      return NextResponse.json({ 
        error: 'Unsupported file type. Please use PDF, TXT, MD, CSV, DOCX, or image files (JPG, PNG).' 
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
