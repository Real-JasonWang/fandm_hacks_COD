import { GoogleGenAI } from '@google/genai';
import type { BristolNumber } from '../types';

export const GEMINI_API_KEY_STORAGE = 'cod_gemini_api_key';
export const GEMINI_MODEL_STORAGE = 'cod_gemini_model';

// Default API key loaded securely from Vite environment (see .env / .env.example)
export const PRELOADED_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

// Default and Cascade Models
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export const SUPPORTED_AI_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Production Flash & Vision)', tag: 'Recommended' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (High Speed & Efficiency)', tag: 'Fast' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Next-Gen Multimodal)', tag: 'Next-Gen' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Experimental Flash Vision)', tag: 'Experimental' },
  { id: 'gemma-4-31b-it', name: 'Gemma 4 31B Dense (Multimodal Vision)', tag: 'Dense' },
  { id: 'gemma-4-26b-a4b-it', name: 'Gemma 4 26B/4B MoE (Multimodal Vision)', tag: 'MoE' },
];

export const FALLBACK_CASCADE = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash',
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

export interface VisualChainOfThought {
  morphologyAnalysis: string;    // Stage 1: Specimen Morphology & Edge Consistency
  moistureAnalysis: string;      // Stage 2: Water Dynamics & Basin Dispersion
  differentialDiagnosis: string; // Stage 3: Differential Diagnosis & Exclusion Logic
  clinicalAssessment: string;    // Stage 4: Colonic Motility & Hydration Assessment
}

export function generateDefaultChainOfThought(type: BristolNumber): VisualChainOfThought {
  switch (type) {
    case 1:
      return {
        morphologyAnalysis: 'Observed separate, distinct, hard nut-like pellet formations (diameter < 1.5 cm) with dense, rigid, compressed surface geometry and abrupt contours without longitudinal unity.',
        moistureAnalysis: 'Extremely low free moisture (< 60%); specimen resists water dissolution in the porcelain basin with zero turbidity or water discoloration.',
        differentialDiagnosis: 'Ruled out Type 2 due to complete absence of fused cylindrical grouping; ruled out Type 3 due to absence of formed cracked sausage. Discontinuous hard pellets definitively establish Type 1.',
        clinicalAssessment: 'Severely delayed colonic transit time (typically > 72 hours), excessive distal mucosal water reabsorption, indicating acute constipation and dehydration risk.',
      };
    case 2:
      return {
        morphologyAnalysis: 'Formed cylindrical sausage mass composed of distinct, agglomerated hard lumps and nodules, exhibiting a prominent cobblestone-like, irregular perimeter.',
        moistureAnalysis: 'Low moisture content; maintains structural integrity with minimal peripheral flaking and zero basin water turbidity.',
        differentialDiagnosis: 'Ruled out Type 1 because pellets are bonded into a contiguous log; ruled out Type 3 because surface is deeply nodular rather than smooth with surface cracks. Conclusive for Type 2.',
        clinicalAssessment: 'Mild colonic transit deceleration; inadequate dietary insoluble fiber and suboptimal daily hydration.',
      };
    case 3:
      return {
        morphologyAnalysis: 'Well-formed continuous cylinder with observable superficial linear fissures and longitudinal surface cracks along an otherwise cohesive body.',
        moistureAnalysis: 'Normal physiological moisture balance (70-75%); retains intact structural boundary upon water impact without basin clouding or wall adhesion.',
        differentialDiagnosis: 'Ruled out Type 2 because individual lump nodules are absent; ruled out Type 4 because surface is cracked rather than completely smooth. Conclusive for Type 3.',
        clinicalAssessment: 'Healthy normal stool; optimal intestinal transit time between 30 and 40 hours with adequate fiber intake.',
      };
    case 4:
      return {
        morphologyAnalysis: 'Optimal uniform cylindrical morphology with smooth, continuous surface contour; resembles a soft snake or banana with zero surface fissures or nodular bumps.',
        moistureAnalysis: 'Ideal hydration equilibrium (approx. 75% water-to-solid ratio); smooth sedimentation with zero residue or basin staining.',
        differentialDiagnosis: 'Ruled out Type 3 due to absence of surface fissures; ruled out Type 5 because log is uninterrupted without segment blob detachment. Gold Standard Type 4.',
        clinicalAssessment: 'Peak digestive mucosal lubrication and balanced gut microbiome; ideal transit time and dietary fiber-hydration equilibrium.',
      };
    case 5:
      return {
        morphologyAnalysis: 'Discrete, soft, pliable fragment blobs with well-defined, clear-cut boundaries (no ragged or frayed margins).',
        moistureAnalysis: 'Moderately elevated moisture; fragments retain individual demarcated contours in basin water without immediate clouding.',
        differentialDiagnosis: 'Ruled out Type 4 due to absence of continuous cylinder; ruled out Type 6 because fragment borders are distinctly sharp rather than ragged and fluffy. Conclusive for Type 5.',
        clinicalAssessment: 'Accelerated colonic transit or low dietary soluble fiber; stool evacuated before complete terminal water absorption.',
      };
    case 6:
      return {
        morphologyAnalysis: 'Fragmented, fluffy masses with irregular, ragged, frayed margins; lacks solid cylindrical core or defined edges; distinctly mushy consistency.',
        moistureAnalysis: 'High moisture content (> 85%); rapid local dissolution causing noticeable basin water cloudiness and wall soiling.',
        differentialDiagnosis: 'Ruled out Type 5 because margins are ragged and frayed rather than clean-cut; ruled out Type 7 because soft mushy solid pieces remain. Conclusive for Type 6.',
        clinicalAssessment: 'Marked intestinal hyper-motility, mild osmotic or secretory diarrhea; increased electrolyte loss risk. Rehydration with oral electrolytes advised.',
      };
    case 7:
    default:
      return {
        morphologyAnalysis: 'Complete absence of formed solid particles; fluid suspension with diffuse discoloration throughout the toilet basin.',
        moistureAnalysis: 'Extremely high free-water content (> 90%); immediate dispersion with widespread basin turbidity.',
        differentialDiagnosis: 'Ruled out Type 6 due to total lack of solid or ragged mush fragments. Conclusive for severe watery diarrhea (Type 7).',
        clinicalAssessment: 'Acute secretory diarrhea or enteritis; impaired mucosal water absorption with rapid dehydration risk. Immediate fluid and electrolyte replacement recommended.',
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
  clinicalTip: string;
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
      'gemini-2.5-flash',
      'gemini-1.5-flash',
    ].filter((v, i, arr) => arr.indexOf(v) === i);
    let lastError: unknown = null;
    for (const m of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents: 'Ping: Reply with "OK" if connected.',
        });
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

  const prompt = `You are a world-class board-certified gastroenterologist and clinical diagnostic AI evaluating the Bristol Stool Form Scale (BSFS).
Analyze this specimen using rigorous clinical methodology and provide an explicit, highly structured Chain-of-Thought with clinical justifications:

1. Anti-Spoofing & Liveness: Ensure this is an authentic human bowel movement in a porcelain toilet basin. (If melted chocolate, toy rubber, peanut butter, pet feces, or not in a toilet, flag isValid = false).
2. Bristol Stool Form Scale (BSFS) Types 1-7:
   - Type 1: Separate hard lumps, like nuts (severe constipation)
   - Type 2: Sausage-shaped but lumpy (mild constipation)
   - Type 3: Like a sausage with cracks on surface (normal/healthy)
   - Type 4: Like a sausage or snake, smooth and soft (optimal benchmark)
   - Type 5: Soft blobs with clear-cut edges (mild loose/low fiber)
   - Type 6: Fluffy pieces with ragged edges, a mushy stool (diarrhea/rapid motility)
   - Type 7: Watery, no solid pieces; entirely liquid (severe diarrhea)
3. Structured Chain-of-Thought Reasoning (4-Stage Clinical Deductions):
   - morphologyAnalysis: Specimen morphology & edge consistency (solid contour, ragged vs smooth margins, fragment shape)
   - moistureAnalysis: Water dynamics & basin dispersion (free-water proportion, water clouding, dissipation rate)
   - differentialDiagnosis: Differential diagnosis & exclusion logic (explicitly explain why adjacent types were rejected and why this type is confirmed)
   - clinicalAssessment: Colonic motility & hydration assessment (gut transit velocity, mucosal reabsorption rate, dietary electrolyte advice)

Return ONLY a valid JSON object matching this schema with NO markdown code fences or backticks:
{
  "isValid": boolean,
  "bristolType": number (1 to 7, or null if invalid),
  "confidenceScore": number (0.0 to 1.0),
  "hydrationAlert": "OPTIMAL" | "DEHYDRATED" | "CRITICAL_DRY" | "NORMAL",
  "cleanlinessAlert": boolean,
  "soilingIndex": number (0 to 5),
  "detectedSymptoms": string[],
  "clinicalTip": string,
  "chainOfThought": {
    "morphologyAnalysis": string,
    "moistureAnalysis": string,
    "differentialDiagnosis": string,
    "clinicalAssessment": string
  }
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
      const bristolType = parsed.bristolType
        ? (Math.min(7, Math.max(1, Math.round(parsed.bristolType))) as BristolNumber)
        : null;

      // Extract or synthesize structured Chain-of-Thought
      let cot: VisualChainOfThought | undefined = undefined;
      if (parsed.chainOfThought && typeof parsed.chainOfThought === 'object') {
        cot = {
          morphologyAnalysis: String(parsed.chainOfThought.morphologyAnalysis || ''),
          moistureAnalysis: String(parsed.chainOfThought.moistureAnalysis || ''),
          differentialDiagnosis: String(parsed.chainOfThought.differentialDiagnosis || ''),
          clinicalAssessment: String(parsed.chainOfThought.clinicalAssessment || ''),
        };
      }
      if ((!cot || !cot.differentialDiagnosis) && bristolType) {
        cot = generateDefaultChainOfThought(bristolType);
      }

      const reasoningSteps = cot
        ? [
            `Morphology: ${cot.morphologyAnalysis}`,
            `Moisture: ${cot.moistureAnalysis}`,
            `Differential: ${cot.differentialDiagnosis}`,
            `Clinical: ${cot.clinicalAssessment}`,
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
        clinicalTip: parsed.clinicalTip || 'Clinical visual evaluation completed.',
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
