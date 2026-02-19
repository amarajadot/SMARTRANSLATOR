import React from 'react';
import { ProcessingMode, ModeConfig } from '../types';

interface ModeSelectorProps {
  currentMode: ProcessingMode;
  onModeChange: (mode: ProcessingMode) => void;
}

const MODES: ModeConfig[] = [
  {
    id: ProcessingMode.SUMMARY,
    title: 'التلخيص الصحفي',
    description: 'استخراج الجوهر (30%)، التركيز على الأسئلة الخمسة.',
    icon: '📝',
  },
  {
    id: ProcessingMode.TRANSLATION,
    title: 'ترجمة احترافية',
    description: 'ترجمة كاملة (100%) دقيقة تلتزم بدليل التحرير.',
    icon: 'translate', // Using text icon for simplicity or replace with SVG
  },
  {
    id: ProcessingMode.SYNTHESIS,
    title: 'التحرير التكاملي',
    description: 'دمج المصادر وصياغة قصة متماسكة مع سياق إضافي.',
    icon: '📰',
  },
];

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {MODES.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-right flex flex-col h-full
            ${
              currentMode === mode.id
                ? 'border-brand-blue bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-brand-gold hover:bg-yellow-50/30 bg-white'
            }
          `}
        >
          <div className="flex items-center justify-between mb-3 w-full">
            <span className="text-2xl filter grayscale-0">{mode.id === ProcessingMode.TRANSLATION ? 
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-brand-blue">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
                </svg>
             : mode.icon}</span>
            {currentMode === mode.id && (
              <span className="h-3 w-3 rounded-full bg-brand-blue animate-pulse"></span>
            )}
          </div>
          <h3 className={`font-bold text-lg mb-2 ${currentMode === mode.id ? 'text-brand-blue' : 'text-gray-800'}`}>
            {mode.title}
          </h3>
          <p className="text-sm text-gray-500 font-sans leading-relaxed">
            {mode.description}
          </p>
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;