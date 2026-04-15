'use client';

import { useState, useRef } from 'react';
import { Spinner } from '@/components/ui/Spinner';

interface FileUploaderProps {
  onUpload: (content: string) => void;
  accept?: string;
  multiple?: boolean;
}

export function FileUploader({ onUpload, accept = '.txt,.md,.docx,.pdf,.csv', multiple = false }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setProgress(25);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/parse-pdf', { method: 'POST', body: formData });
      setProgress(75);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await res.json();
      setProgress(100);
      onUpload(data.text);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-[#14b8a6] bg-[#14b8a6]/10' 
            : 'border-white/20 hover:border-white/40'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <Spinner />
            <div className="mt-4 w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#14b8a6] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm mt-2">Uploading... {progress}%</p>
          </div>
        ) : (
          <>
            <div className="text-4xl mb-2">📄</div>
            <p className="text-white font-medium">
              Drop files here or click to upload
            </p>
            <p className="text-gray-400 text-sm mt-1">
              PDF, DOCX, TXT, CSV, PNG, JPG supported
            </p>
          </>
        )}
      </div>
    </div>
  );
}