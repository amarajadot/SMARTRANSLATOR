export enum ProcessingMode {
  SUMMARY = 'SUMMARY',
  TRANSLATION = 'TRANSLATION',
  SYNTHESIS = 'SYNTHESIS'
}

export interface ProcessingResult {
  text: string;
  report?: string;
  recommendations?: string;
  groundingMetadata?: any;
  streaming?: boolean;
}

export type StreamCallback = (partialText: string) => void;

export interface ModeConfig {
  id: ProcessingMode;
  title: string;
  description: string;
  icon: string;
}