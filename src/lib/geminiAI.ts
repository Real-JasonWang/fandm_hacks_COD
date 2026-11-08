import { GoogleGenAI } from '@google/genai';
import type { BristolNumber } from '../types';

export const GEMINI_API_KEY_STORAGE = 'cod_gemini_api_key';
export const GEMINI_MODEL_STORAGE = 'cod_gemini_model';

// Default API key loaded securely from Vite environment (see .env / .env.example)
export const PRELOADED_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

// Default and Cascade Models
export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';

export const SUPPORTED_AI_MODELS = [
  { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite (Fast & Multimodal)', tag: 'Recommended' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash (Balanced Vision & Logic)', tag: 'Accurate' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash-Lite (High Speed)', tag: 'Fast' },
  { id: 'gemini-flash-lite-latest', name: 'Gemini Flash-Lite Latest (Always Current)', tag: 'Latest' },
];

export const FALLBACK_CASCADE = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
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
  const stored = localStorage.getItem(GEMINI_MODEL_STORAGE);
  if (stored && SUPPORTED_AI_MODELS.some((m) => m.id === stored)) {
    return stored;
  }
  return DEFAULT_GEMINI_MODEL;
}

export function setStoredModel(model: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(GEMINI_MODEL_STORAGE, model);
  }
}

export interface VisualChainOfThought {
  morphologyAnalysis: string;    // Stage 1: Shape & Edge Consistency
  moistureAnalysis: string;      // Stage 2: Water Dynamics
  differentialDiagnosis: string; // Stage 3: Comparison & Type Decision
  speedAssessment: string;       // Stage 4: Digestion Speed & Hydration
}

export function generateDefaultChainOfThought(type: BristolNumber): VisualChainOfThought {
  switch (type) {
    case 1:
      return {
        morphologyAnalysis: 'Separate, hard little lumps like nuts. Dense and tough to pass.',
        moistureAnalysis: 'Very dry. Sinks right to the bottom with clean water and zero clouding.',
        differentialDiagnosis: 'Not Type 2 because the lumps are separate, not stuck together. Definitely Type 1.',
        speedAssessment: 'Slow digestion. Your body pulled out too much water, usually from dehydration or low fiber.',
      };
    case 2:
      return {
        morphologyAnalysis: 'A lumpy sausage made of hard chunks stuck together.',
        moistureAnalysis: 'Pretty dry. Stays solid in the bowl without breaking apart or clouding.',
        differentialDiagnosis: 'Not Type 1 because it is in one log. Not Type 3 because it is bumpy lumps, not surface cracks. Classic Type 2.',
        speedAssessment: 'Moved through a bit too slow. A sign you could use an extra glass of water today.',
      };
    case 3:
      return {
        morphologyAnalysis: 'Sausage-shaped with cracks across the surface.',
        moistureAnalysis: 'Normal moisture balance. Stays intact in the water with clean edges.',
        differentialDiagnosis: 'Not Type 2 because it is not lumpy chunks. Not Type 4 because of the surface cracks. Healthy Type 3.',
        speedAssessment: 'Good, healthy digestion speed. Everything moved through on schedule.',
      };
    case 4:
      return {
        morphologyAnalysis: 'Smooth and soft like a banana or snake. No cracks or bumps.',
        moistureAnalysis: 'Ideal moisture. Rests in the water completely intact without clouding.',
        differentialDiagnosis: 'Not Type 3 because the surface is totally smooth. Not Type 5 because it did not break into pieces. Textbook Type 4.',
        speedAssessment: 'Spot-on digestion speed. Your hydration and food balance are working great.',
      };
    case 5:
      return {
        morphologyAnalysis: 'Soft, separate blobs with clean-cut edges.',
        moistureAnalysis: 'Has more water than usual. Floats easily but does not dissolve immediately.',
        differentialDiagnosis: 'Not Type 4 because it broke into blobs. Not Type 6 because the edges are clean, not ragged. Type 5.',
        speedAssessment: 'Moved through your colon a bit fast. Adding some soluble fiber like oats or bread will help firm it up.',
      };
    case 6:
      return {
        morphologyAnalysis: 'Fluffy, mushy pieces with ragged, uneven edges.',
        moistureAnalysis: 'High water content. Breaks apart quickly and clouds the toilet water.',
        differentialDiagnosis: 'Not Type 5 because the edges are ragged and mushy. Not Type 7 because there are still soft solid pieces. Type 6.',
        speedAssessment: 'Gut moved fast today. Often caused by stress, caffeine, or quick-digesting food.',
      };
    case 7:
    default:
      return {
        morphologyAnalysis: 'All liquid with no solid pieces.',
        moistureAnalysis: 'Pure fluid. Immediately spreads through the water.',
        differentialDiagnosis: 'Not Type 6 because there are zero solid chunks left. Pure Type 7 diarrhea.',
        speedAssessment: 'Water rushed straight through without absorbing. Sip water and electrolytes to stay hydrated.',
      };
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
  quickTip: string;
  chainOfThought?: VisualChainOfThought;
  reasoningSteps?: string[];
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
    const userModel = getStoredModel();
    const modelsToTry = [
      userModel,
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
    ].filter((v, i, arr) => arr.indexOf(v) === i);
    let lastError: unknown = null;
    for (const m of modelsToTry) {
      try {
        const pingPromise = ai.models.generateContent({
          model: m,
          contents: 'Ping: Reply with "OK" if connected.',
        });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`${m} ping timed out after 8s`)), 8000)
        );
        const response = await Promise.race([pingPromise, timeoutPromise]);
        if (response.text) {
          return { success: true, message: `Google Gemini API connection verified (${m})!` };
        }
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError || new Error('Received empty response from API.');
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

  const prompt = `You are evaluating a photo for the Bristol Stool Form Scale (BSFS) for a student health app.
Analyze this photo and provide a clear 4-stage reasoning breakdown.
IMPORTANT STYLE REQUIREMENT: Use short, plain high school English. NO medical jargon, NO clichés, NO robotic corporate filler. Keep every section to 1-2 punchy sentences that any high schooler or college student naturally understands.

1. Anti-Spoofing: Ensure this is a real bowel movement in a toilet bowl. (If melted chocolate, toy, peanut butter, pet poop, or not in a toilet, set isValid = false).
2. Bristol Stool Form Scale (BSFS) Types 1-7:
   - Type 1: Separate hard lumps, like nuts (hard to pass)
   - Type 2: Sausage-shaped but lumpy
   - Type 3: Like a sausage with cracks on surface (normal)
   - Type 4: Like a sausage or snake, smooth and soft (ideal)
   - Type 5: Soft blobs with clear-cut edges (passed easily)
   - Type 6: Fluffy pieces with ragged edges, a mushy stool
   - Type 7: Watery, no solid pieces; entirely liquid (diarrhea)
3. 4-Stage Reasoning (in short plain high school English with zero clichés):
   - morphologyAnalysis: What it looks like (shape, smooth vs lumpy, cracks, chunks).
   - moistureAnalysis: How it looks in the toilet water (holds together, dissolves, clouds the bowl).
   - differentialDiagnosis: Why it is this type and not the next types (e.g. why not Type 3, why not Type 5).
   - speedAssessment: Digestion speed and what it means (moving fast, normal, or slow; simple tip).

Return ONLY a valid JSON object matching this schema with NO markdown code fences or backticks:
{
  "isValid": boolean,
  "bristolType": number (1 to 7, or null if invalid),
  "confidenceScore": number (0.0 to 1.0),
  "hydrationAlert": "OPTIMAL" | "DEHYDRATED" | "CRITICAL_DRY" | "NORMAL",
  "cleanlinessAlert": boolean,
  "soilingIndex": number (0 to 5),
  "detectedSymptoms": string[],
  "quickTip": string (1 short high school english sentence, no clichés),
  "chainOfThought": {
    "morphologyAnalysis": string (1-2 short high school english sentences),
    "moistureAnalysis": string (1-2 short high school english sentences),
    "differentialDiagnosis": string (1-2 short high school english sentences),
    "speedAssessment": string (1-2 short high school english sentences)
  }
}`;

  const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');

  let lastError: unknown = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[Vision Check] Running analysis using: ${modelName}`);
      const generatePromise = ai.models.generateContent({
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
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`${modelName} vision request timed out after 12s`)), 12000)
      );
      const response = await Promise.race([generatePromise, timeoutPromise]);

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`Failed to parse structured JSON from ${modelName}`);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      let bristolType: BristolNumber | null = null;
      if (parsed.bristolType && typeof parsed.bristolType === 'number') {
        bristolType = Math.min(7, Math.max(1, Math.round(parsed.bristolType))) as BristolNumber;
      } else {
        // Fallback: extract any mentioned "Type 1" through "Type 7" in reasoning text
        const typeMatch = text.match(/Type\s*([1-7])/i);
        if (typeMatch && typeMatch[1]) {
          bristolType = parseInt(typeMatch[1], 10) as BristolNumber;
        } else {
          bristolType = 4;
        }
      }

      // Extract or synthesize structured Chain-of-Thought
      let cot: VisualChainOfThought | undefined = undefined;
      if (parsed.chainOfThought && typeof parsed.chainOfThought === 'object') {
        cot = {
          morphologyAnalysis: String(parsed.chainOfThought.morphologyAnalysis || ''),
          moistureAnalysis: String(parsed.chainOfThought.moistureAnalysis || ''),
          differentialDiagnosis: String(parsed.chainOfThought.differentialDiagnosis || ''),
          speedAssessment: String(parsed.chainOfThought.speedAssessment || ''),
        };
      }
      if ((!cot || !cot.differentialDiagnosis) && bristolType) {
        cot = generateDefaultChainOfThought(bristolType);
      }

      const reasoningSteps = cot
        ? [
            `Shape: ${cot.morphologyAnalysis}`,
            `Moisture: ${cot.moistureAnalysis}`,
            `Why this type: ${cot.differentialDiagnosis}`,
            `Digestion speed: ${cot.speedAssessment}`,
          ]
        : [];

      return {
        isValid: Boolean(parsed.isValid),
        bristolType,
        confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.88,
        hydrationAlert: parsed.hydrationAlert || 'NORMAL',
        cleanlinessAlert: Boolean(parsed.cleanlinessAlert),
        soilingIndex: typeof parsed.soilingIndex === 'number' ? parsed.soilingIndex : 0,
        detectedSymptoms: Array.isArray(parsed.detectedSymptoms) ? parsed.detectedSymptoms : [],
        quickTip: parsed.quickTip || 'Looking good! Keep staying hydrated.',
        chainOfThought: cot,
        reasoningSteps,
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
    ...FALLBACK_CASCADE.filter((m) => m !== preferredModel),
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
      const generatePromise = ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`${modelName} NLP request timed out after 10s`)), 10000)
      );
      const response = await Promise.race([generatePromise, timeoutPromise]);

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
