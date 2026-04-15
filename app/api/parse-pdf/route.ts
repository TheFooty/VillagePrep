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

    if (fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)) {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const blob = new Blob([new Uint8Array(arrayBuffer)], { type: file.type || 'image/png' });
      const result = await worker.recognize(blob);
      extractedText = result.data.text;
      await worker.terminate();
    }
    else if (fileName.endsWith('.pdf')) {
      try {
        const pdfParse = require('pdf-parse') as any;
        const data = pdfParse(buffer);
        extractedText = data.text;
      } catch (pdfErr) {
        console.error('PDF parse error:', pdfErr);
        return NextResponse.json({ 
          error: 'Could not read PDF. Try converting to DOCX or TXT format.' 
        }, { status: 400 });
      }
    }
    else if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.csv')) {
      extractedText = buffer.toString('utf-8');
    }
    else if (fileName.endsWith('.docx')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    }
    else {
      return NextResponse.json({ 
        error: 'Unsupported file type. Use PDF, TXT, MD, CSV, DOCX, or images (JPG, PNG).' 
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