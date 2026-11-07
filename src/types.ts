// types.ts - hackathon types yolo
// TODO: refactor this shit later, gradual territory fields added
export type DormId = 'bonchek' | 'brooks' | 'ware' | 'weis' | 'new_college';

export interface Dorm {
  id: DormId;
  name: string;
  quadName: string;
  colorHex: string;
  residentCount: number; // N_dorm
  powerMultiplier: number; // Sqrt normalized
  territoryPercentage: number;
}

export interface RestroomNode {
  id: string;
  buildingName: string;
  floor: number;
  roomCode: string;
  x: number; // canvas percent [0, 100]
  y: number; // canvas percent [0, 100]
  controllingDormId: DormId | null;
  baseHp: number; // 0 - 100
  soilingIndex: number; // 0 - 5
  cleanlinessAlert: boolean;
  trafficCount: number;
  lastCleanedMinutesAgo: number;
  captureProgress: number; // 0 - 100 gradual capture bar
  contestState: 'STABLE' | 'CONTESTED' | 'FORTIFIED';
  influenceRadius: number; // dynamic radius for canvas wave rings
}

export interface GemmaVisionResult {
  isValid: boolean;
  rejectionReason: string;
  bristolType: number; // 1 - 7
  confidenceScore: number;
  combatPoints: number; // 0 - 100
  effectivePower: number;
  cleanlinessAlert: boolean;
  soilingSeverity: number;
  waterTurbidity: 'CLEAR' | 'MILDLY_CLOUDY' | 'HIGHLY_TURBID';
  steatorrheaDetected: boolean;
  hematuriaDetected: boolean;
  clinicalFeedback: string;
  processingTimeMs: number;
}

export interface ConquestEvent {
  id: string;
  dormId: DormId;
  dormName: string;
  restroomName: string;
  effectivePower: number;
  timestamp: string;
}
