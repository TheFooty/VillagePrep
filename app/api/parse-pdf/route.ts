import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf');
    const loadingTask = pdfjs.getDocument({ data: buffer });
    const pdfDocument = await loadingTask.promise;

    let extractedText = '';
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum += 1) {
      const page = await pdfDocument.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items
        .map(item => ('str' in item ? item.str : ''))
        .join(' ');
      extractedText += pageText + '\n\n';
    }

    if (!extractedText.trim()) {
      throw new Error('No text could be extracted from the PDF.');
    }

    return NextResponse.json({ text: extractedText.trim() });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unable to parse PDF.';
    console.error('PDF parse error:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}