export type ModeType = 'playful' | 'discreet';

export type HouseId = 'Bonchek' | 'Brooks' | 'Roschel' | 'Ware' | 'Weis';

export interface House {
  id: HouseId;
  name: string;
  color: string;
  part: number; // participation %
  checks: number;
}

export type BristolNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface BristolInfo {
  name: string;
  fun: string;
  zone: 'hard' | 'ideal' | 'soft' | 'loose';
}

export interface CheckInEntry {
  id: string;
  ts: number;
  pooped: boolean;
  bristol: BristolNumber | null;
  symptoms: string[];
  sleep: number;
  water: number;
  veg: number;
  stress: number;
}

export interface Restroom {
  id: string;
  b: string; // building name
  f: string; // floor
  x: number;
  y: number;
  lat?: number;
  lng?: number;
  all: boolean;    // all-gender
  acc: boolean;    // ADA accessible
  per: boolean;    // period products
  single: boolean; // single stall
  baby: boolean;   // changing table
}

export type RestroomReportType = 'clean' | 'supplies' | 'ok' | 'maintenance';

export interface RestroomReport {
  clean: number;
  supplies: number;
  ok: number;
  maintenance?: number;
  ts: number;
}

export interface AppSettings {
  onboarded: boolean;
  house: HouseId;
  mode: ModeType;
  logs: CheckInEntry[];
  reports: Record<string, RestroomReport>;
  installHidden: boolean;
  demo?: boolean;
}

export type TabType = 'today' | 'insights' | 'map' | 'house' | 'facilities';

export interface SymptomDef {
  id: string;
  label: string;
  flag?: boolean;
}

// ==========================================
// Legacy Types for Backwards Compatibility
// ==========================================
export type DormId = 'bonchek' | 'brooks' | 'ware' | 'weis' | 'new_college';

export interface Dorm {
  id: DormId;
  name: string;
  color: string;
  motto: string;
  territoryPercent: number;
  activeAgents: number;
  handicapWeight: number;
}

export interface RestroomNode {
  id: string;
  name: string;
  buildingName: string;
  floor: number;
  lat: number;
  lng: number;
  xPercent: number;
  yPercent: number;
  ownerDormId: DormId;
  baseHp: number;
  contestState: 'FORTIFIED' | 'CONTESTED' | 'CRITICAL';
  demandHeat: number;
  supplyLevel: number;
  genderNeutral: boolean;
  handicapAccessible: boolean;
  captureProgress: number;
  influenceRadius: number;
}

export interface GemmaVisionResult {
  bristolType: number;
  confidenceScore: number;
  isAuthenticHumanWaste: boolean;
  hydrationLevel: 'OPTIMAL' | 'DEHYDRATED' | 'CRITICAL_DRY';
  antiSpoofStagePassed: number;
  latencyMs: number;
  explanation: string;
}

export interface ConquestEvent {
  id: string;
  dormId: DormId;
  dormName: string;
  restroomName: string;
  effectivePower: number;
  timestamp: string;
}
