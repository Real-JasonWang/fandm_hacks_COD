import { GoogleGenAI } from '@google/genai';
import type { BristolNumber } from '../types';

export const GEMINI_API_KEY_STORAGE = 'cod_gemini_api_key';
export const GEMINI_MODEL_STORAGE = 'cod_gemini_model';

// Default API key loaded securely from Vite environment (see .env / .env.example)
export const PRELOADED_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

// Default and Cascade Models
export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';

export const SUPPORTED_AI_MODELS = [
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Latest Flash Vision & NLP)', tag: 'Recommended' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', tag: 'Fast' },
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', tag: 'Lite' },
  { id: 'gemma-4-31b-it', name: 'Gemma 4 31B Dense (Multimodal Vision)', tag: 'Dense' },
  { id: 'gemma-4-26b-a4b-it', name: 'Gemma 4 26B/4B MoE (Multimodal Vision)', tag: 'MoE' },
];

export const FALLBACK_CASCADE = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemma-4-31b-it',
  'gemma-4-26b-a4b-it',
];

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return PRELOADED_API_KEY;
  const stored = localStorage.getItem(GEMINI_API_KEY_STORAGE);
  if (stored && stored.trim().length > 0) {
    return stored.trim();
  }
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }
  return PRELOADED_API_KEY;
}

export function setStoredApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(GEMINI_API_KEY_STORAGE, key.trim());
  }
}

export function getStoredModel(): string {
  if (typeof window === 'undefined') return DEFAULT_GEMINI_MODEL;
  return localStorage.getItem(GEMINI_MODEL_STORAGE) || DEFAULT_GEMINI_MODEL;
}

export function setStoredModel(model: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(GEMINI_MODEL_STORAGE, model);
  }
}

export interface VisionAnalysisResult {
  isValid: boolean;
  bristolType: BristolNumber | null;
  confidenceScore: number;
  hydrationAlert: 'OPTIMAL' | 'DEHYDRATED' | 'CRITICAL_DRY' | 'NORMAL';
  cleanlinessAlert: boolean;
  soilingIndex: number;
  detectedSymptoms: string[];
  clinicalTip: string;
  modelUsed: string;
}

export interface SemanticLogResult {
  pooped: boolean;
  bristol: BristolNumber | null;
  symptoms: string[];
  sleep: number;
  water: number;
  veg: number;
  stress: number;
  summary: string;
  modelUsed: string;
}

// Error message cleaner
export function formatAiErrorMessage(err: unknown): string {
  if (!err) return 'An unexpected error occurred during AI evaluation.';
  let msg = '';
  if (typeof err === 'string') {
    msg = err;
  } else if (err instanceof Error) {
    msg = err.message;
  } else {
    msg = String(err);
  }

  try {
    const parsed = JSON.parse(msg);
    if (parsed?.error?.message) {
      return parsed.error.message;
    }
  } catch {
    // not JSON
  }

  // Remove common ugly error prefixes
  return msg.replace(/^Error:\s*/, '').trim();
}

function createGenAI(customKey?: string) {
  const key = customKey || getStoredApiKey();
  if (!key) {
    throw new Error('No API key provided. Please configure your Google Gemini / Gemma API key.');
  }
  return new GoogleGenAI({ apiKey: key });
}

// 1. Connection ping
export async function testGeminiApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Ping: Reply with "OK" if connected.',
    });
    if (response.text) {
      return { success: true, message: 'Google Gemini / Gemma API connection verified successfully!' };
    }
    return { success: false, message: 'Received empty response from API.' };
  } catch (err: unknown) {
    return { success: false, message: formatAiErrorMessage(err) };
  }
}

// 2. Multimodal Vision Analysis with Automatic Model Fallback Cascade
export async function analyzeStoolImageWithGemma(
  base64Data: string,
  mimeType: string = 'image/jpeg',
  apiKey?: string
): Promise<VisionAnalysisResult> {
  const ai = createGenAI(apiKey);
  const preferredModel = getStoredModel();
  const modelsToTry = [
    preferredModel,
    ...FALLBACK_CASCADE.filter((m) => m !== preferredModel),
  ];

  const prompt = `You are an expert clinical gastrointestinal health AI assistant evaluating the Bristol Stool Form Scale (BSFS).
Analyze this specimen using the 5-stage clinical protocol:
1. Anti-Spoofing & Liveness: Ensure this is an authentic human bowel movement in a porcelain toilet basin. If it is melted chocolate, gag toy rubber, peanut butter, pet feces, or not in a toilet, flag isValid = false.
2. Core Morphology: Classify into Bristol Stool Form Scale (BSFS) Type 1 to 7:
   - Type 1: Separate hard lumps, like nuts (severe constipation)
   - Type 2: Sausage-shaped but lumpy (mild constipation)
   - Type 3: Like a sausage but with cracks on its surface (healthy)
   - Type 4: Like a sausage or snake, smooth and soft (optimal benchmark)
   - Type 5: Soft blobs with clear-cut edges (mild loose)
   - Type 6: Fluffy pieces with ragged edges, a mushy stool (diarrhea)
   - Type 7: Watery, no solid pieces; entirely liquid (severe diarrhea)
3. Water Dynamics & Soiling: Note water turbidity. High cloudiness/dissolution (Types 6-7) causes custodial bowl soiling (cleanlinessAlert = true, soilingIndex 1-5).
4. Red Flag Warnings: Identify any signs of blood, dark tarry discoloration, or acute warning signs.

Return ONLY a valid JSON object strictly matching this schema with NO markdown backticks:
{
  "isValid": boolean,
  "bristolType": number (1 to 7, or null if invalid),
  "confidenceScore": number (0.0 to 1.0),
  "hydrationAlert": "OPTIMAL" | "DEHYDRATED" | "CRITICAL_DRY" | "NORMAL",
  "cleanlinessAlert": boolean,
  "soilingIndex": number (0 to 5),
  "detectedSymptoms": string[],
  "clinicalTip": string
}`;

  const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');

  let lastError: unknown = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[Gemma Vision] Attempting clinical analysis using model: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
            ],
          },
        ],
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`Failed to parse structured JSON from ${modelName}`);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        isValid: Boolean(parsed.isValid),
        bristolType: parsed.bristolType
          ? (Math.min(7, Math.max(1, Math.round(parsed.bristolType))) as BristolNumber)
          : null,
        confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.88,
        hydrationAlert: parsed.hydrationAlert || 'NORMAL',
        cleanlinessAlert: Boolean(parsed.cleanlinessAlert),
        soilingIndex: typeof parsed.soilingIndex === 'number' ? parsed.soilingIndex : 0,
        detectedSymptoms: Array.isArray(parsed.detectedSymptoms) ? parsed.detectedSymptoms : [],
        clinicalTip: parsed.clinicalTip || 'Clinical visual evaluation completed.',
        modelUsed: modelName,
      };
    } catch (err) {
      console.warn(`[Gemma Vision] Model ${modelName} encountered issue, cascading to fallback...`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('All cascade models failed to process image.');
}

// 3. Natural Language Log Parser with Auto-Fallback
export async function parseNaturalLanguageLogWithGemini(
  userText: string,
  apiKey?: string
): Promise<SemanticLogResult> {
  const ai = createGenAI(apiKey);
  const preferredModel = getStoredModel();
  const modelsToTry = [
    preferredModel,
    ...['gemini-3.5-flash', 'gemini-3.8-flash', 'gemma-4-31b-it', 'gemma-4-26b-a4b-it', 'gemini-3.5-flash-lite'].filter(
      (m) => m !== preferredModel
    ),
  ];

  const prompt = `You are an AI wellness logging assistant for Call of Doodie.
The student says: "${userText}"

Extract health parameters into structured format:
- pooped: boolean (did they have a bowel movement?)
- bristol: number 1 to 7 (Bristol Stool Scale, or null if unmentioned)
  * 1: Hard pebbles / constipation
  * 2: Lumpy log
  * 3: Sausage with cracks
  * 4: Smooth soft snake / banana (ideal benchmark)
  * 5: Soft blobs / nuggets
  * 6: Ragged fluffy mush
  * 7: Liquid diarrhea
- symptoms: string[] from ["bloating", "cramps", "gas", "straining", "urgency", "nausea", "blood", "black", "pain"]
- sleep: number (hours of sleep, default 7.0 if unmentioned)
- water: number (glasses of water 1-10, default 5 if unmentioned)
- veg: number (fruit/veg servings 0-10, default 2 if unmentioned)
- stress: number 0 to 4 (0=Calm, 1=Okay, 2=Meh, 3=Stressed, 4=Very Stressed, default 1 if unmentioned)
- summary: short friendly 1-sentence confirmation in English.

Return ONLY a valid JSON object strictly matching this schema with NO markdown backticks:
{
  "pooped": boolean,
  "bristol": number | null,
  "symptoms": string[],
  "sleep": number,
  "water": number,
  "veg": number,
  "stress": number,
  "summary": string
}`;

  let lastError: unknown = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[Gemini NLP] Parsing user log with model: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`Failed to parse natural language JSON from ${modelName}`);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return {
        pooped: Boolean(parsed.pooped),
        bristol: parsed.bristol
          ? (Math.min(7, Math.max(1, Math.round(parsed.bristol))) as BristolNumber)
          : null,
        symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : [],
        sleep: typeof parsed.sleep === 'number' ? Math.min(14, Math.max(0, parsed.sleep)) : 7,
        water: typeof parsed.water === 'number' ? Math.min(10, Math.max(0, parsed.water)) : 5,
        veg: typeof parsed.veg === 'number' ? Math.min(10, Math.max(0, parsed.veg)) : 2,
        stress: typeof parsed.stress === 'number' ? Math.min(4, Math.max(0, parsed.stress)) : 1,
        summary: parsed.summary || 'Logged successfully from your notes!',
        modelUsed: modelName,
      };
    } catch (err) {
      console.warn(`[Gemini NLP] Model ${modelName} failed, falling back...`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('All models failed to parse natural language log.');
}
