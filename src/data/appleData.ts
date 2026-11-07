import type { House, BristolInfo, BristolNumber, Restroom, RestroomReport, CheckInEntry, SymptomDef, AppSettings } from '../types';

export const HOUSES: House[] = [
  { id: "Bonchek", name: "Bonchek College House", color: "#3D6FE0", part: 61, checks: 412 },
  { id: "Brooks",  name: "Brooks College House",  color: "#D9483F", part: 57, checks: 376 },
  { id: "Roschel", name: "Roschel College House", color: "#2A9A72", part: 49, checks: 298 },
  { id: "Ware",    name: "Ware College House",    color: "#8E5CE0", part: 54, checks: 389 },
  { id: "Weis",    name: "Weis College House",    color: "#D48A0F", part: 66, checks: 341 },
];

export const BRISTOL: Record<BristolNumber, BristolInfo> = {
  1: { name: "Separate hard lumps", fun: "Little pebbles", zone: "hard" },
  2: { name: "Lumpy sausage",        fun: "Lumpy log",      zone: "hard" },
  3: { name: "Sausage with cracks",  fun: "Cracked log",    zone: "ideal" },
  4: { name: "Smooth & soft snake",  fun: "The perfect noodle", zone: "ideal" },
  5: { name: "Soft blobs",           fun: "Soft nuggets",   zone: "soft" },
  6: { name: "Mushy, ragged pieces", fun: "Fluffy mush",    zone: "loose" },
  7: { name: "Watery, no pieces",    fun: "Full liquid",    zone: "loose" },
};

export const ZONE = {
  hard: { label: "Hard side", tag: "t-sun", tip: "Leaning constipated — water, fiber and movement usually help." },
  ideal: { label: "Ideal zone", tag: "t-mint", tip: "Right where doctors like to see it." },
  soft: { label: "A bit soft", tag: "t-lav", tip: "Often a sign of low fiber — usually not a worry." },
  loose: { label: "Loose side", tag: "t-peach", tip: "Diarrhea — sip fluids. If it lasts more than 2 days, check in with Health Services." },
};

export const SYMPTOMS: SymptomDef[] = [
  { id: "bloating", label: "Bloating" },
  { id: "cramps", label: "Cramps" },
  { id: "gas", label: "Gas" },
  { id: "straining", label: "Straining" },
  { id: "urgency", label: "Urgency" },
  { id: "nausea", label: "Nausea" },
  { id: "blood", label: "Blood", flag: true },
  { id: "black", label: "Black / tarry", flag: true },
  { id: "pain", label: "Severe pain", flag: true },
];

export const STRESS: [string, string][] = [
  ["😌", "Calm"],
  ["🙂", "Okay"],
  ["😐", "Meh"],
  ["😟", "Stressed"],
  ["😫", "Very"],
];

export const FACTS: string[] = [
  "Pooping anywhere from 3× a day to 3× a week is considered normal.",
  "The Bristol Stool Scale was created at Bristol Royal Infirmary in 1997 — clinicians worldwide still use it today.",
  "Your gut and brain communicate constantly (the gut–brain axis). College exam stress directly impacts gut motility.",
  "Young adults need 7+ hours of quality sleep. Sleep deprivation is linked to irregular digestion and gut discomfort.",
  "Most college students eat far less fiber than the recommended ~25–38 grams a day.",
  "Coffee stimulates colonic motor activity for roughly 30% of people — that's why morning brew sends you running.",
];

export const RESTROOMS: Restroom[] = [
  { id: "asfc", b: "Alumni Sports & Fitness (ASFC)", f: "Main Lobby & Gym", x: 380, y: 110, lat: 40.0512, lng: -76.3192, all: true, acc: true, per: true, single: true, baby: true },
  { id: "stadium", b: "Shadek Stadium Field House", f: "Basement & 1st Floor", x: 550, y: 75, lat: 40.0524, lng: -76.3172, all: true, acc: true, per: false, single: true, baby: false },
  { id: "lombardo", b: "Lombardo Welcome Center", f: "1st & 2nd Floors", x: 340, y: 55, lat: 40.0518, lng: -76.3202, all: true, acc: true, per: true, single: true, baby: true },
  { id: "hack", b: "Hackman Physical Science Lab", f: "Basement Level", x: 205, y: 265, lat: 40.0494, lng: -76.3218, all: true, acc: true, per: false, single: true, baby: false },
  { id: "martin", b: "Martin Library of the Sciences", f: "2nd Floor", x: 185, y: 325, lat: 40.0488, lng: -76.3220, all: true, acc: true, per: true, single: true, baby: false },
  { id: "schnader", b: "Schnader Hall", f: "Basement, 1st, 2nd, 3rd Floors", x: 165, y: 400, lat: 40.0478, lng: -76.3222, all: true, acc: true, per: true, single: true, baby: false },
  { id: "lsb", b: "Life Science & Philosophy (LSP)", f: "Basement & 1st Floor", x: 365, y: 250, lat: 40.0496, lng: -76.3182, all: true, acc: true, per: true, single: true, baby: false },
  { id: "goeth", b: "Goethean Hall", f: "2nd Floor", x: 325, y: 350, lat: 40.0486, lng: -76.3188, all: true, acc: false, per: false, single: true, baby: false },
  { id: "stag", b: "Stager Hall", f: "1st Floor Hallway", x: 350, y: 440, lat: 40.0478, lng: -76.3185, all: false, acc: false, per: false, single: false, baby: false },
  { id: "keip", b: "Keiper Liberal Arts", f: "1st Floor All-Gender Restroom", x: 360, y: 520, lat: 40.0471, lng: -76.3184, all: true, acc: true, per: true, single: true, baby: false },
  { id: "harris", b: "Patricia E Harris Center", f: "3rd Floor", x: 385, y: 580, lat: 40.0468, lng: -76.3178, all: true, acc: true, per: true, single: true, baby: false },
  { id: "main", b: "Old Main", f: "2nd Floor Cupola Hall", x: 305, y: 605, lat: 40.0470, lng: -76.3194, all: true, acc: true, per: false, single: true, baby: false },
  { id: "ware", b: "North Ben (Ware College House)", f: "Floors 1-3 & 2 in Commons", x: 575, y: 265, lat: 40.0498, lng: -76.3158, all: true, acc: true, per: true, single: true, baby: false },
  { id: "bonchek", b: "South Ben (Bonchek College House)", f: "1st, 2nd, 3rd Floors", x: 570, y: 350, lat: 40.0488, lng: -76.3159, all: true, acc: true, per: true, single: true, baby: false },
  { id: "brooks", b: "Buchanan Hall (Brooks College House)", f: "1st, 2nd, 3rd Floors", x: 565, y: 435, lat: 40.0479, lng: -76.3160, all: true, acc: true, per: false, single: true, baby: false },
  { id: "weis", b: "Weis Hall (Weis College House)", f: "1st, 2nd, 3rd Floors", x: 560, y: 520, lat: 40.0469, lng: -76.3161, all: true, acc: true, per: true, single: true, baby: false },
  { id: "roschel", b: "Roschel College House & Arts Center", f: "1st, 2nd, 3rd, 4th Floors", x: 515, y: 615, lat: 40.0458, lng: -76.3168, all: true, acc: true, per: true, single: true, baby: true },
  { id: "writers", b: "Philadelphia Alumni Writers House", f: "1st & 2nd Floors", x: 460, y: 700, lat: 40.0452, lng: -76.3175, all: true, acc: true, per: true, single: true, baby: false },
  { id: "lib1", b: "Shadek-Fackenthal Library", f: "1st Floor Information Commons", x: 205, y: 685, lat: 40.0463, lng: -76.3210, all: true, acc: true, per: true, single: true, baby: false },
  { id: "lib2", b: "Shadek-Fackenthal Library", f: "2nd Floor Quiet Stacks", x: 235, y: 710, lat: 40.0462, lng: -76.3208, all: false, acc: true, per: true, single: false, baby: false },
  { id: "scc1", b: "Steinman College Center (SCC)", f: "Phillips Museum of Art & Dining", x: 330, y: 685, lat: 40.0462, lng: -76.3195, all: true, acc: true, per: true, single: true, baby: true },
  { id: "harwood", b: "Harwood Commons & Ben Franklin Hall", f: "1st Floor Catering Suite", x: 360, y: 650, lat: 40.0465, lng: -76.3188, all: true, acc: true, per: true, single: true, baby: false },
  { id: "park", b: "Buchanan Park Pavilion", f: "West Campus Pavilion", x: 145, y: 810, lat: 40.0448, lng: -76.3228, all: false, acc: true, per: false, single: false, baby: true },
];

export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Default F&M Campus Center coordinates (Hartman Green / Old Main)
export const FM_CAMPUS_DEFAULT = {
  lat: 40.0475,
  lng: -76.3190,
  name: "Hartman Green (F&M Quad)"
};

export const FILTERS = [
  { id: "any", label: "All" },
  { id: "all", label: "⚧ All-gender" },
  { id: "acc", label: "♿ Accessible" },
  { id: "per", label: "🌸 Period products" },
  { id: "single", label: "🚪 Single-stall" },
  { id: "baby", label: "🍼 Changing table" },
];

export function calculateCheckInPoints(entry: { water: number; sleep: number }): number {
  let pts = 10;
  if (entry.water >= 6) pts += 5;
  if (entry.sleep >= 7) pts += 5;
  return pts;
}

export function seedReports(): Record<string, RestroomReport> {
  return {};
}

export function seedLogs(): CheckInEntry[] {
  return [];
}

export const STORAGE_KEY = "cod_demo_v1";

export function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        logs: Array.isArray(parsed.logs)
          ? parsed.logs.filter((l: CheckInEntry) => l && typeof l.id === 'string' && !l.id.startsWith('s'))
          : [],
        reports: typeof parsed.reports === 'object' && parsed.reports !== null ? parsed.reports : {},
      };
    }
  } catch (e) {
    console.error("Failed to load settings from localStorage", e);
  }
  return {
    onboarded: false,
    house: "Ware",
    mode: "playful",
    logs: [],
    reports: {},
    installHidden: false,
    demo: false,
  };
}

export function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings to localStorage", e);
  }
}
