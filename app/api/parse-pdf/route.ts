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

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = '';

    if (fileName.endsWith('.pdf')) {
      const pdfjs = await import('pdfjs-dist');
      if (typeof window === 'undefined') {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      }
      const loadingTask = pdfjs.getDocument({ data: buffer });
      const pdfDocument = await loadingTask.promise;

      for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum += 1) {
        const page = await pdfDocument.getPage(pageNum);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        extractedText += pageText + '\n\n';
      }
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.csv')) {
      extractedText = buffer.toString('utf-8');
    } else if (fileName.endsWith('.docx')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: 'No text could be extracted from the file.' }, { status: 400 });
    }

    return NextResponse.json({ text: extractedText.trim() });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unable to parse file';
    console.error('File parse error:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
