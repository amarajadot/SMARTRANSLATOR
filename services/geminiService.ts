import { GoogleGenAI, Tool } from "@google/genai";
import { ProcessingMode, ProcessingResult, StreamCallback } from "../types";
import { EDITORIAL_GUIDELINES, MODE_INSTRUCTIONS } from "../constants";

// Hoisted AI client — created once, reused across all calls
const getAI = (() => {
  let instance: GoogleGenAI | null = null;
  return () => {
    if (!instance) {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key not found in environment variables");
      instance = new GoogleGenAI({ apiKey });
    }
    return instance;
  };
})();

const MODEL_NAME = "gemini-2.0-flash";

const buildSystemInstruction = (mode: ProcessingMode): string => `
${EDITORIAL_GUIDELINES}

${MODE_INSTRUCTIONS[mode]}

هام جداً:
قم بتحليل النص ومعالجته، ثم قدم النتيجة بالتنسيق التالي بالضبط:

## المخرجات
[النص المعالج بالكامل هنا]

## تقرير التحرير
[اشرح التعديلات التي أجريتها]

## التوصيات
[نصائح للصحفي لتحسين الكتابة]
`;

/**
 * Parses the streamed markdown response into structured sections.
 */
function parseMarkdownSections(fullText: string): ProcessingResult {
  const sections = fullText.split(/^## /m).filter(Boolean);

  let processedText = '';
  let report = '';
  let recommendations = '';

  for (const section of sections) {
    const firstNewline = section.indexOf('\n');
    const heading = section.substring(0, firstNewline).trim();
    const body = section.substring(firstNewline + 1).trim();

    if (heading.includes('المخرجات') || heading.includes('النتيجة')) {
      processedText = body;
    } else if (heading.includes('تقرير') || heading.includes('التحرير')) {
      report = body;
    } else if (heading.includes('التوصيات') || heading.includes('توصيات')) {
      recommendations = body;
    }
  }

  // Fallback: if no sections were parsed, treat entire text as output
  if (!processedText && !report && !recommendations) {
    processedText = fullText;
  }

  return { text: processedText, report, recommendations };
}

/**
 * Streams journalistic content processing with real-time text updates.
 */
export const processJournalisticContent = async (
  content: string,
  mode: ProcessingMode,
  onStream: StreamCallback
): Promise<ProcessingResult> => {
  const ai = getAI();

  const tools: Tool[] = [];
  if (mode === ProcessingMode.SYNTHESIS) {
    tools.push({ googleSearch: {} });
  }

  try {
    const response = await ai.models.generateContentStream({
      model: MODEL_NAME,
      contents: [
        {
          role: 'user',
          parts: [{ text: content }]
        }
      ],
      config: {
        systemInstruction: buildSystemInstruction(mode),
        temperature: 0.3,
        tools: tools.length > 0 ? tools : undefined,
      },
    });

    let fullText = '';

    for await (const chunk of response) {
      const chunkText = chunk.text || '';
      fullText += chunkText;
      onStream(fullText);
    }

    // Parse the final text into structured sections
    const result = parseMarkdownSections(fullText);

    // Check for grounding metadata from the last chunk
    const lastCandidate = (response as any).candidates?.[0];
    if (lastCandidate?.groundingMetadata) {
      result.groundingMetadata = lastCandidate.groundingMetadata;
    }

    return result;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "An unexpected error occurred while communicating with Gemini.");
  }
};