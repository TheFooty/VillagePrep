'use client';

import { Flashcard } from '@/types';
import { Button } from '@/components/ui/Button';

interface FlashcardExporterProps {
  cards: Flashcard[];
  title?: string;
}

export function FlashcardExporter({ cards, title = 'Flashcards' }: FlashcardExporterProps) {
  function exportToPDF() {
    const content = cards.map((card, i) => `
      <div style="page-break-after: always; padding: 40px; border: 1px solid #ddd;">
        <div style="font-size: 24px; margin-bottom: 30px;">${i + 1}. ${card.front}</div>
        <div style="font-size: 20px; color: #666;">${card.back}</div>
      </div>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .card { padding: 40px; border: 1px solid #ddd; margin-bottom: 20px; }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportToPrint() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = cards.map((card) => `
      <div class="card">
        <div class="front">${card.front}</div>
        <div class="back">${card.back}</div>
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .card { 
            padding: 30px; 
            border: 2px solid #000; 
            margin-bottom: 20px; 
            min-height: 100px;
          }
          .front { font-size: 18px; font-weight: bold; }
          .back { font-size: 16px; color: #666; margin-top: 10px; }
          @media print {
            .card { page-break-after: always; border: 1px solid #000; }
          }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  return (
    <div className="flex gap-3">
      <Button variant="secondary" onClick={exportToPDF}>
        📥 Export HTML
      </Button>
      <Button onClick={exportToPrint}>
        🖨️ Print
      </Button>
    </div>
  );
}