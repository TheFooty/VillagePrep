import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Dynamic import with proper configuration
    const pdfjs = await import('pdfjs-dist');
    
    // Set up worker for Vercel
    if (typeof window === 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
    }
    
    const loadingTask = pdfjs.getDocument({ data: buffer });
    const pdfDocument = await loadingTask.promise;

    let extractedText = '';
    
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum += 1) {
      const page = await pdfDocument.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ');
      extractedText += pageText + '\n\n';
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: 'No text found in PDF. The file may be scanned or image-based.' }, { status: 400 });
    }

    return NextResponse.json({ text: extractedText.trim() });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unable to parse PDF';
    console.error('PDF parse error:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
