import React, { useState, useRef } from 'react';
import { ProcessingMode, ProcessingResult } from './types';
import ModeSelector from './components/ModeSelector';
import OutputDisplay from './components/OutputDisplay';
import { processJournalisticContent } from './services/geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<ProcessingMode>(ProcessingMode.SUMMARY);
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const handleProcess = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setStreamingText('');
    abortRef.current = false;

    try {
      const response = await processJournalisticContent(
        inputText,
        mode,
        (partialText) => {
          if (!abortRef.current) {
            setStreamingText(partialText);
          }
        }
      );
      setStreamingText('');
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء المعالجة');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setStreamingText('');
    setError(null);
    abortRef.current = true;
  };

  const isStreaming = loading && streamingText.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-right" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-gold rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
              ج
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">المترجم المحرر الذكي</h1>
              <p className="text-xs text-gray-500">مساعد ترجمة صحفي متوافق مع معايير الجزيرة</p>
            </div>
          </div>
          <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 hidden sm:block">
            Gemini 2.0 Flash ⚡
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Mode Selector */}
        <section>
          <ModeSelector currentMode={mode} onModeChange={setMode} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <section className="flex flex-col gap-4">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 rounded-t-lg flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">النص المدخل / المصادر</span>
                <button
                  onClick={handleClear}
                  className="text-xs text-red-500 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded transition-colors"
                  disabled={!inputText}
                >
                  مسح النص
                </button>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  mode === ProcessingMode.SYNTHESIS
                    ? "أدخل النصوص أو التقارير المتعددة هنا لدمجها..."
                    : "أدخل النص أو الرابط المراد معالجته هنا..."
                }
                className="w-full h-80 p-4 resize-none outline-none text-gray-700 font-sans leading-relaxed bg-white rounded-b-lg focus:ring-0"
              />
            </div>

            <button
              onClick={handleProcess}
              disabled={loading || !inputText.trim()}
              className={`
                w-full py-4 rounded-xl font-bold text-white shadow-lg transform transition-all duration-200
                flex items-center justify-center gap-2
                ${loading || !inputText.trim()
                  ? 'bg-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-brand-blue hover:bg-blue-800 hover:-translate-y-1 hover:shadow-xl active:translate-y-0'
                }
              `}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isStreaming ? 'جاري الاستقبال... ⚡' : 'جاري الاتصال...'}
                </>
              ) : (
                <>
                  <span>بدء المعالجة</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 rotate-180">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
          </section>

          {/* Output Section */}
          <section>
            <OutputDisplay
              content={result?.text || ''}
              loading={loading}
              streamingText={streamingText}
              groundingMetadata={result?.groundingMetadata}
              report={result?.report}
              recommendations={result?.recommendations}
            />
            {result && (
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-xs">تمت الصياغة بواسطة الذكاء الاصطناعي - يرجى المراجعة التحريرية قبل النشر.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;