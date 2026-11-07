import { GoogleGenAI } from '@google/genai';
import type { BristolNumber } from '../types';

export const GEMINI_API_KEY_STORAGE = 'cod_gemini_api_key';
export const GEMINI_MODEL_STORAGE = 'cod_gemini_model';

export const DEFAULT_GEMINI_MODEL = 'gemma-4-26b-a4b-it';

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem(GEMINI_API_KEY_STORAGE) ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    ''
  );
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
  soilingIndex: number; // 0 to 5 for facilities
  detectedSymptoms: string[];
  clinicalTip: string;
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
}

// Helper to initialize Google Gen AI
function createGenAI(customKey?: string) {
  const key = customKey || getStoredApiKey();
  if (!key) {
    throw new Error('No API key provided. Please configure your Google Gemini / Gemma API key in Settings.');
  }
  return new GoogleGenAI({ apiKey: key });
}

// 1. Verify / Test API key connection
export async function testGeminiApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Ping: Reply with "OK" if connected.',
    });
    if (response.text) {
      return { success: true, message: 'API key verified successfully!' };
    }
    return { success: false, message: 'Received empty response from API.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: msg };
  }
}

// 2. Multimodal Vision Analysis (Zero-Disk in-memory stream)
export async function analyzeStoolImageWithGemma(
  base64Data: string,
  mimeType: string = 'image/jpeg',
  apiKey?: string
): Promise<VisionAnalysisResult> {
  const ai = createGenAI(apiKey);
  const modelName = getStoredModel();

  const prompt = `You are an expert clinical gastrointestinal health AI assistant running Bristol Stool Form Scale (BSFS) grading.
Analyze this image using the 5-stage clinical protocol:
1. Anti-Spoofing & Liveness: Check if this is an authentic human bowel movement in a porcelain toilet bowl. If it is clearly melted chocolate, toy rubber, peanut butter, pet waste, or a non-toilet surface, flag isValid = false.
2. Core Morphology: Classify the specimen into Bristol Stool Form Scale (BSFS) Type 1 to 7:
   - Type 1: Separate hard lumps, like nuts
   - Type 2: Sausage-shaped but lumpy
   - Type 3: Like a sausage but with cracks on surface (Healthy)
   - Type 4: Like a sausage or snake, smooth and soft (Optimal benchmark)
   - Type 5: Soft blobs with clear-cut edges
   - Type 6: Fluffy pieces with ragged edges, a mushy stool
   - Type 7: Watery, no solid pieces; entirely liquid
3. Water Dynamics & Soiling: Check water clarity/turbidity. Highly cloudy or liquid stool (Types 6-7) causes custodial bowl soiling (cleanlinessAlert = true, soilingIndex 1-5).
4. Red Flag Detection: Look for signs of blood or severe discoloration.

Return ONLY a valid JSON object strictly matching this schema with no markdown formatting or backticks:
{
  "isValid": boolean,
  "bristolType": number (1 to 7, or null if invalid),
  "confidenceScore": number (0.0 to 1.0),
  "hydrationAlert": "OPTIMAL" | "DEHYDRATED" | "CRITICAL_DRY" | "NORMAL",
  "cleanlinessAlert": boolean,
  "soilingIndex": number (0 to 5),
  "detectedSymptoms": string[] (e.g. ["blood", "bloating", "cramps"]),
  "clinicalTip": string
}`;

  const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');

  try {
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
      throw new Error('Failed to parse structured clinical response from Gemma 4.');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      isValid: Boolean(parsed.isValid),
      bristolType: parsed.bristolType ? (Math.min(7, Math.max(1, Math.round(parsed.bristolType))) as BristolNumber) : null,
      confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.85,
      hydrationAlert: parsed.hydrationAlert || 'NORMAL',
      cleanlinessAlert: Boolean(parsed.cleanlinessAlert),
      soilingIndex: typeof parsed.soilingIndex === 'number' ? parsed.soilingIndex : 0,
      detectedSymptoms: Array.isArray(parsed.detectedSymptoms) ? parsed.detectedSymptoms : [],
      clinicalTip: parsed.clinicalTip || 'Visual analysis completed.',
    };
  } catch (error) {
    // Fallback: If Gemma model not accessible on user's key tier, fallback to gemini-2.5-flash
    if (modelName !== 'gemini-2.5-flash') {
      console.warn(`Gemma model ${modelName} encountered error, trying gemini-2.5-flash fallback...`, error);
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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
      const text = fallbackResponse.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          isValid: Boolean(parsed.isValid),
          bristolType: parsed.bristolType ? (Math.min(7, Math.max(1, Math.round(parsed.bristolType))) as BristolNumber) : 4,
          confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.88,
          hydrationAlert: parsed.hydrationAlert || 'NORMAL',
          cleanlinessAlert: Boolean(parsed.cleanlinessAlert),
          soilingIndex: typeof parsed.soilingIndex === 'number' ? parsed.soilingIndex : 0,
          detectedSymptoms: Array.isArray(parsed.detectedSymptoms) ? parsed.detectedSymptoms : [],
          clinicalTip: parsed.clinicalTip || 'Clinical visual inference completed.',
        };
      }
    }
    throw error;
  }
}

// 3. Natural Language Log Parser (一句话智能记账)
export async function parseNaturalLanguageLogWithGemini(
  userText: string,
  apiKey?: string
): Promise<SemanticLogResult> {
  const ai = createGenAI(apiKey);
  const prompt = `You are an AI wellness logging assistant for Call of Doodie.
The student says: "${userText}"

Extract their health check-in parameters:
- pooped: boolean (did they have a bowel movement?)
- bristol: number 1 to 7 (Bristol Stool Scale, or null if they didn't poop or couldn't deduce)
  * Type 1: Hard pebbles / constipation
  * Type 2: Lumpy log
  * Type 3: Sausage with cracks
  * Type 4: Smooth soft snake / banana (ideal)
  * Type 5: Soft blobs / nuggets
  * Type 6: Ragged fluffy mush / loose
  * Type 7: Liquid diarrhea
- symptoms: string[] from ["bloating", "cramps", "gas", "straining", "urgency", "nausea", "blood", "black", "pain"]
- sleep: number (hours of sleep, default 7.0 if unmentioned)
- water: number (glasses of water 1-10, default 5 if unmentioned)
- veg: number (fruit and vegetable servings 0-10, default 2 if unmentioned)
- stress: number 0 to 4 (0=Calm, 1=Okay, 2=Meh, 3=Stressed, 4=Very Stressed, default 1 if unmentioned)
- summary: short friendly 1-sentence confirmation in the user's language.

Return ONLY a valid JSON object matching the schema with no markdown backticks:
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

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const text = response.text || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse natural language log.');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    pooped: Boolean(parsed.pooped),
    bristol: parsed.bristol ? (Math.min(7, Math.max(1, Math.round(parsed.bristol))) as BristolNumber) : null,
    symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : [],
    sleep: typeof parsed.sleep === 'number' ? Math.min(14, Math.max(0, parsed.sleep)) : 7,
    water: typeof parsed.water === 'number' ? Math.min(10, Math.max(0, parsed.water)) : 5,
    veg: typeof parsed.veg === 'number' ? Math.min(10, Math.max(0, parsed.veg)) : 2,
    stress: typeof parsed.stress === 'number' ? Math.min(4, Math.max(0, parsed.stress)) : 1,
    summary: parsed.summary || 'Logged successfully from your voice/text notes!',
  };
}
