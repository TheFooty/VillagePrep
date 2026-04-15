'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert max-w-none overflow-hidden ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({children}) => <h1 className="text-xl sm:text-2xl font-bold text-white mt-6 mb-4 break-words overflow-wrap-anywhere">{children}</h1>,
          h2: ({children}) => <h2 className="text-lg sm:text-xl font-semibold text-white mt-5 mb-3 break-words overflow-wrap-anywhere">{children}</h2>,
          h3: ({children}) => <h3 className="text-base sm:text-lg font-medium text-white mt-4 mb-2 break-words overflow-wrap-anywhere">{children}</h3>,
          p: ({children}) => <p className="text-gray-300 mb-4 leading-relaxed text-sm sm:text-base break-words overflow-wrap-anywhere">{children}</p>,
          ul: ({children}) => <ul className="list-disc list-inside text-gray-300 mb-4 space-y-1">{children}</ul>,
          ol: ({children}) => <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-1">{children}</ol>,
          li: ({children}) => <li className="text-gray-300 text-sm sm:text-base break-words overflow-wrap-anywhere">{children}</li>,
          strong: ({children}) => <strong className="text-white font-semibold break-words overflow-wrap-anywhere">{children}</strong>,
          code: ({children}) => <code className="bg-white/10 text-[#14b8a6] px-1.5 py-0.5 rounded text-xs sm:text-sm break-all">{children}</code>,
          pre: ({children}) => <pre className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 overflow-x-auto mb-4">{children}</pre>,
          blockquote: ({children}) => <blockquote className="border-l-4 border-[#14b8a6] pl-4 italic text-gray-400 my-4 text-sm sm:text-base break-words overflow-wrap-anywhere">{children}</blockquote>,
          table: ({children}) => <table className="w-full border-collapse my-4 table-fixed">{children}</table>,
          th: ({children}) => <th className="border border-white/20 bg-white/5 px-2 sm:px-4 py-2 text-left text-white text-xs sm:text-sm break-words overflow-wrap-anywhere">{children}</th>,
          td: ({children}) => <td className="border border-white/10 px-2 sm:px-4 py-2 text-gray-300 text-xs sm:text-sm break-words overflow-wrap-anywhere">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}