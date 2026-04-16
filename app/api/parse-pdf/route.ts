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
      try {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng');
        const blob = new Blob([new Uint8Array(arrayBuffer)], { type: file.type || 'image/png' });
        const result = await worker.recognize(blob);
        extractedText = result.data.text;
        await worker.terminate();
      } catch (ocrError) {
        console.error('OCR error:', ocrError);
        return NextResponse.json({ 
          error: 'Failed to extract text from image. Please try a clearer image or different format.' 
        }, { status: 400 });
      }
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
      try {
        extractedText = buffer.toString('utf-8');
      } catch (encodingErr) {
        console.error('Text encoding error:', encodingErr);
        return NextResponse.json({ 
          error: 'Could not read text file. Ensure it is UTF-8 encoded.' 
        }, { status: 400 });
      }
    }
    else if (fileName.endsWith('.docx')) {
      try {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } catch (docxErr) {
        console.error('DOCX parse error:', docxErr);
        return NextResponse.json({ 
          error: 'Could not read DOCX file. Try converting to PDF or TXT format.' 
        }, { status: 400 });
      }
    }
    else {
      return NextResponse.json({ 
        error: 'Unsupported file type. Use PDF, TXT, MD, CSV, DOCX, or images (JPG, PNG).' 
      }, { status: 400 });
    }

    if (!extractedText || !extractedText.trim()) {
      return NextResponse.json({ error: 'No text could be extracted from the file. The file may be empty or scanned.' }, { status: 400 });
    }

    // Limit content size to prevent token limit issues
    const maxChars = 50000;
    const trimmedText = extractedText.trim().slice(0, maxChars);
    
    return NextResponse.json({ 
      text: trimmedText,
      truncated: extractedText.length > maxChars
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unable to parse file';
    console.error('File parse error:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
