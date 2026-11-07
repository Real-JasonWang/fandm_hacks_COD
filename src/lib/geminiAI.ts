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

export interface VisualChainOfThought {
  morphologyAnalysis: string;    // 阶段一：几何形态与质地边缘分析
  moistureAnalysis: string;      // 阶段二：水分动力学与盆中分散度
  differentialDiagnosis: string; // 阶段三：布里斯托量表鉴别排他判定依据
  clinicalAssessment: string;    // 阶段四：结肠蠕动与肠道健康推断
}

export function generateDefaultChainOfThought(type: BristolNumber): VisualChainOfThought {
  switch (type) {
    case 1:
      return {
        morphologyAnalysis: '观察到独立的硬结小团粒（直径通常 < 1.5 cm），表面坚硬紧实，边缘截然断开，无任何连续条柱结构。',
        moistureAnalysis: '含水量极低（< 60%），在便盆水体中几乎不扩散、不溶出微粒，沉降迅速且无周围水体混浊。',
        differentialDiagnosis: '排除 Type 2（无颗粒融合成香肠状整体），排除 Type 3（无圆柱裂纹体）。坚硬离散坚果状特征确定为 Type 1。',
        clinicalAssessment: '结肠传输极其缓慢（Colonic transit time > 72h），远端结肠过度重吸收水分，提示重度便秘及脱水风险。',
      };
    case 2:
      return {
        morphologyAnalysis: '呈现整体柱状或香肠状形态，但表面由多个明显凹凸的硬质团块凝集而成，外边缘粗糙起伏。',
        moistureAnalysis: '低水分含量，在水中结构保持完整，仅边缘有极微量碎屑脱落，便盆水质清澈无大面积混浊。',
        differentialDiagnosis: '排除 Type 1（硬块已粘连为一体而非独立散落），排除 Type 3（表面凹凸不平而非光滑微裂）。判定为 Type 2。',
        clinicalAssessment: '轻度结肠便秘；肠道排空延迟，膳食不溶性纤维摄入不足，饮水量亟需提升。',
      };
    case 3:
      return {
        morphologyAnalysis: '成形的圆柱形香肠结构，表面可见数条清晰的细小浅表裂纹与纵向纹理，整体形态饱满。',
        moistureAnalysis: '正常生理水分含量（约 70-75%），入水后保持良好外形完整度，无水体浑浊与便器粘连。',
        differentialDiagnosis: '排除 Type 2（无大块硬结突起），排除 Type 4（表面带有浅层干裂裂痕而非完全柔顺光滑）。判定为 Type 3。',
        clinicalAssessment: '属于健康生理范围；排便顺畅，肠道通过时间处于 30-40 小时理想区间。',
      };
    case 4:
      return {
        morphologyAnalysis: '形态极其光滑连续，呈柔软香蕉状或蛇形圆柱体，表面完全无裂痕、无硬块突起，边缘极为柔和。',
        moistureAnalysis: '理想水化比例（约 75% 固体与水黄金比），沉降平稳，水体保持透明，对便盆零悬挂或污染。',
        differentialDiagnosis: '排除 Type 3（表面完全光滑无干裂细痕），排除 Type 5（无分段软块）。布里斯托金标准 Type 4。',
        clinicalAssessment: '肠道微生态与消化道动力处于巅峰状态；结肠黏液润滑与水分吸收平衡，膳食纤维与水分比例完美。',
      };
    case 5:
      return {
        morphologyAnalysis: '呈现多个柔软的分离团块（Soft blobs），各团块边缘轮廓清晰整齐（Clear-cut edges），质地柔润。',
        moistureAnalysis: '中高水分含量，入水后部分小团块浮动或轻度软化，但仍保有独立的物理外形边界。',
        differentialDiagnosis: '排除 Type 4（丧失连续柱状整体结构），排除 Type 6（边缘整齐截然，未出现破碎蓬松的毛边毛刺）。判定为 Type 5。',
        clinicalAssessment: '肠道蠕动略有加速，结肠未充分完成终末水分吸收，通常与可溶性纤维略显不足或餐后反射强烈相关。',
      };
    case 6:
      return {
        morphologyAnalysis: '蓬松破碎的软絮状小块（Fluffy pieces），边缘极其毛糙不整（Ragged edges），完全缺乏成形的柱状或硬质结构。',
        moistureAnalysis: '高水分溢出度（> 85%），水体出现明显散开浑浊现象，极易造成便盆壁粘附与水体染色（Soiling）。',
        differentialDiagnosis: '排除 Type 5（边界完全破损模糊、边缘呈现毛絮状撕裂），排除 Type 7（仍保留大量可见软固体碎屑而非全液体）。判定为 Type 6。',
        clinicalAssessment: '肠道动力过度亢进（Hyper-motility），轻度腹泻或渗透性紊乱；提示肠道菌群短暂失衡或电解质水丢失，需补充电解质水。',
      };
    case 7:
    default:
      return {
        morphologyAnalysis: '完全没有固态结构块，全为浑浊液体或水样喷射状悬浮物，肉眼无任何成形絮片。',
        moistureAnalysis: '极高游离水比例（> 90%），在马桶中迅速向全盆扩散，水质完全混浊并伴随扩散性染色。',
        differentialDiagnosis: '排除 Type 6（完全无任何可识别的固态软块残留）。特征明确符合严重水样便 Type 7。',
        clinicalAssessment: '急性分泌性或渗透性腹泻；肠道黏膜重吸收受阻，存在急性脱水风险，建议立即补液盐（ORS）并观察警示体征。',
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

  const prompt = `You are a world-class board-certified gastroenterologist and clinical diagnostic AI evaluating the Bristol Stool Form Scale (BSFS).
Analyze this specimen using rigorous clinical methodology and provide an explicit, highly structured Chain-of-Thought (思维链与判定依据):

1. Anti-Spoofing & Liveness: Ensure this is an authentic human bowel movement in a porcelain toilet basin. (If melted chocolate, toy rubber, peanut butter, pet feces, or not in a toilet, flag isValid = false).
2. Bristol Stool Form Scale (BSFS) Types 1-7:
   - Type 1: Separate hard lumps, like nuts (severe constipation)
   - Type 2: Sausage-shaped but lumpy (mild constipation)
   - Type 3: Like a sausage with cracks on surface (normal/healthy)
   - Type 4: Like a sausage or snake, smooth and soft (optimal benchmark)
   - Type 5: Soft blobs with clear-cut edges (mild loose/low fiber)
   - Type 6: Fluffy pieces with ragged edges, a mushy stool (diarrhea/rapid motility)
   - Type 7: Watery, no solid pieces; entirely liquid (severe diarrhea)
3. Structured Chain-of-Thought Reasoning (思维链 4 阶段判定依据):
   - morphologyAnalysis: 几何形态与质地边缘特征（描述外形、是否有连续柱体、边缘是否破碎/毛絮/整齐/坚硬）
   - moistureAnalysis: 水分动力学与水体分散度（分析游离水比例、在便盆水体中的扩散、浑浊程度与附着度）
   - differentialDiagnosis: 布里斯托量表鉴别排他逻辑（明确说明为什么排除相邻的分型，最终为何判定为此分型）
   - clinicalAssessment: 结肠生理动力学推断（推断结肠传输速度 Transit Time、黏膜吸水状态及饮食与电解质建议）

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
            `形态分析：${cot.morphologyAnalysis}`,
            `水动力学：${cot.moistureAnalysis}`,
            `鉴别排他：${cot.differentialDiagnosis}`,
            `临床建议：${cot.clinicalAssessment}`,
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
