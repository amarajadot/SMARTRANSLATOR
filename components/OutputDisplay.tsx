import React from 'react';
import ReactMarkdown from 'react-markdown';

interface OutputDisplayProps {
  content: string;
  loading: boolean;
  streamingText?: string;
  groundingMetadata?: any;
  report?: string;
  recommendations?: string;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ content, loading, streamingText, groundingMetadata, report, recommendations }) => {
  const isStreaming = loading && (streamingText?.length ?? 0) > 0;
  const displayContent = content || (isStreaming ? streamingText : '');

  // Initial loading state — before any text arrives
  if (loading && !displayContent) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-center justify-center">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="text-gray-400 font-sans text-sm">جاري الاتصال بالنموذج...</p>
      </div>
    );
  }

  if (!displayContent) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
        <p>النتيجة والتقرير سيظهران هنا</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Output */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-brand-blue px-6 py-3 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            المخرجات
            {isStreaming && (
              <span className="inline-flex items-center gap-1 bg-white/20 text-white/90 text-xs px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                بث مباشر
              </span>
            )}
          </h3>
          {!isStreaming && content && (
            <button
              onClick={() => navigator.clipboard.writeText(content)}
              className="text-white/80 hover:text-white text-xs flex items-center gap-1 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5" />
              </svg>
              نسخ النص
            </button>
          )}
        </div>

        <div className="p-8 prose prose-lg prose-headings:text-brand-blue prose-p:text-gray-800 prose-li:text-gray-700 max-w-none font-serif leading-loose text-justify dir-rtl">
          <ReactMarkdown>{displayContent}</ReactMarkdown>
          {isStreaming && (
            <span className="inline-block w-0.5 h-5 bg-brand-blue animate-pulse mr-1 align-text-bottom"></span>
          )}
        </div>

        {groundingMetadata && groundingMetadata.groundingChunks && (
          <div className="bg-gray-50 border-t border-gray-200 p-4 text-sm font-sans">
            <h4 className="font-bold text-gray-700 mb-2">المصادر المستخدمة (Google Search):</h4>
            <ul className="space-y-1">
              {groundingMetadata.groundingChunks.map((chunk: any, index: number) => {
                if (chunk.web?.uri) {
                  return (
                    <li key={index}>
                      <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block">
                        {chunk.web.title || chunk.web.uri}
                      </a>
                    </li>
                  );
                }
                return null;
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Report and Recommendations Section — only after streaming completes */}
      {!isStreaming && (report || recommendations) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Editorial Report */}
          {report && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <h3 className="text-gray-700 font-bold text-sm">تقرير التعديلات والتحرير</h3>
              </div>
              <div className="p-6 prose prose-sm prose-ul:list-disc prose-li:text-gray-600 font-sans">
                <ReactMarkdown>{report}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations && (
            <div className="bg-white rounded-xl shadow-sm border border-brand-gold/50 overflow-hidden">
              <div className="bg-yellow-50 px-6 py-3 border-b border-yellow-100 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-brand-gold">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m4.5 0a12.06 12.06 0 0 1-4.5 0m0 0a12.06 12.06 0 0 0-3.75-6.47M9 12h3m0 0h3m-3 0v-5.25m0 0a1.5 1.5 0 0 1 3 0m-3 0a1.5 1.5 0 0 0-3 0m-3.75 6.91a9.052 9.052 0 0 1-1.12-6.13m14.86 6.14a9.052 9.052 0 0 0 1.13-6.14" />
                </svg>
                <h3 className="text-gray-800 font-bold text-sm">توصيات للتحسين</h3>
              </div>
              <div className="p-6 prose prose-sm prose-p:text-gray-600 font-sans">
                <ReactMarkdown>{recommendations}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OutputDisplay;