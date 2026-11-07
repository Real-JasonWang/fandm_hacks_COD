import type { Dorm, RestroomNode } from '../types';

// Benchmark average F&M dorm size
export const AVERAGE_DORM_HEADCOUNT = 250;

// The 5 Franklin & Marshall College Houses
export const INITIAL_DORMS: Dorm[] = [
  {
    id: 'bonchek',
    name: 'Bonchek College House',
    quadName: 'Hartman / North Quad',
    colorHex: '#38BDF8', // Cyan
    residentCount: 220,
    powerMultiplier: Number((AVERAGE_DORM_HEADCOUNT / Math.sqrt(220)).toFixed(2)) / 15.5, // ~1.07x normalized
    territoryPercentage: 20
  },
  {
    id: 'brooks',
    name: 'Brooks College House',
    quadName: 'Brooks / Central Quad',
    colorHex: '#F43F5E', // Rose
    residentCount: 240,
    powerMultiplier: Number((AVERAGE_DORM_HEADCOUNT / Math.sqrt(240)).toFixed(2)) / 15.5, // ~1.02x
    territoryPercentage: 25
  },
  {
    id: 'ware',
    name: 'Ware College House',
    quadName: 'Ware / West Quad',
    colorHex: '#10B981', // Emerald
    residentCount: 260,
    powerMultiplier: Number((AVERAGE_DORM_HEADCOUNT / Math.sqrt(260)).toFixed(2)) / 15.5, // ~0.98x
    territoryPercentage: 25
  },
  {
    id: 'weis',
    name: 'Weis College House',
    quadName: 'Weis / East Quad',
    colorHex: '#8B5CF6', // Purple
    residentCount: 210,
    powerMultiplier: Number((AVERAGE_DORM_HEADCOUNT / Math.sqrt(210)).toFixed(2)) / 15.5, // ~1.10x (hits harder!)
    territoryPercentage: 15
  },
  {
    id: 'new_college',
    name: 'New College House & Row',
    quadName: 'College Row / Harrisburg Ave',
    colorHex: '#F59E0B', // Amber
    residentCount: 320,
    powerMultiplier: Number((AVERAGE_DORM_HEADCOUNT / Math.sqrt(320)).toFixed(2)) / 15.5, // ~0.88x (sheer numbers)
    territoryPercentage: 15
  }
];

// F&M Main Campus Restroom Nodes mapped to canvas percentage coordinates (x, y: 0-100)
export const INITIAL_RESTROOMS: RestroomNode[] = [
  {
    id: 'shadek_1f',
    buildingName: 'Shadek-Fackenthal Library',
    floor: 1,
    roomCode: 'LIB-101',
    x: 48,
    y: 52,
    controllingDormId: 'ware',
    baseHp: 92,
    soilingIndex: 0,
    cleanlinessAlert: false,
    trafficCount: 42,
    lastCleanedMinutesAgo: 45
  },
  {
    id: 'shadek_2f',
    buildingName: 'Shadek-Fackenthal Library',
    floor: 2,
    roomCode: 'LIB-204',
    x: 52,
    y: 49,
    controllingDormId: 'brooks',
    baseHp: 75,
    soilingIndex: 1,
    cleanlinessAlert: false,
    trafficCount: 38,
    lastCleanedMinutesAgo: 110
  },
  {
    id: 'steinman_1f',
    buildingName: 'Steinman College Center',
    floor: 1,
    roomCode: 'SCC-112',
    x: 62,
    y: 65,
    controllingDormId: 'bonchek',
    baseHp: 60,
    soilingIndex: 3,
    cleanlinessAlert: false,
    trafficCount: 89,
    lastCleanedMinutesAgo: 160
  },
  {
    id: 'hackman_1f',
    buildingName: 'Hackman Physical Sciences Labs',
    floor: 1,
    roomCode: 'HACK-108',
    x: 44,
    y: 35,
    controllingDormId: 'brooks',
    baseHp: 85,
    soilingIndex: 0,
    cleanlinessAlert: false,
    trafficCount: 24,
    lastCleanedMinutesAgo: 90
  },
  {
    id: 'barshinger_lsb',
    buildingName: 'Barshinger Life Sciences Building',
    floor: 1,
    roomCode: 'LSB-120',
    x: 35,
    y: 40,
    controllingDormId: 'ware',
    baseHp: 100,
    soilingIndex: 0,
    cleanlinessAlert: false,
    trafficCount: 31,
    lastCleanedMinutesAgo: 30
  },
  {
    id: 'stager_hall',
    buildingName: 'Stager Hall',
    floor: 1,
    roomCode: 'STAG-105',
    x: 42,
    y: 62,
    controllingDormId: 'weis',
    baseHp: 80,
    soilingIndex: 1,
    cleanlinessAlert: false,
    trafficCount: 45,
    lastCleanedMinutesAgo: 130
  },
  {
    id: 'asfc_gym',
    buildingName: 'Alumni Sports & Fitness Center',
    floor: 1,
    roomCode: 'ASFC-LOBBY',
    x: 68,
    y: 20,
    controllingDormId: 'new_college',
    baseHp: 95,
    soilingIndex: 0,
    cleanlinessAlert: false,
    trafficCount: 56,
    lastCleanedMinutesAgo: 75
  }
];
