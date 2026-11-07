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
  { id: "lib1", b: "Shadek-Fackenthal Library", f: "1st floor", x: 114, y: 286, all: true,  acc: true,  per: true,  single: true,  baby: false },
  { id: "lib2", b: "Shadek-Fackenthal Library", f: "2nd floor", x: 114, y: 348, all: false, acc: true,  per: true,  single: false, baby: false },
  { id: "scc1", b: "Steinman College Center",   f: "1st floor", x: 232, y: 270, all: true,  acc: true,  per: true,  single: true,  baby: true },
  { id: "scc0", b: "Steinman College Center",   f: "Lower level", x: 232, y: 306, all: false, acc: false, per: true,  single: false, baby: false },
  { id: "hack", b: "Hackman Physical Sciences", f: "1st floor", x: 130, y: 74,  all: false, acc: true,  per: false, single: false, baby: false },
  { id: "lsb",  b: "Barshinger Life Sciences",  f: "Atrium",    x: 276, y: 100, all: true,  acc: true,  per: true,  single: true,  baby: false },
  { id: "stag", b: "Stager Hall",               f: "1st floor", x: 338, y: 284, all: false, acc: false, per: false, single: false, baby: false },
  { id: "keip", b: "Keiper Liberal Arts",       f: "2nd floor", x: 338, y: 340, all: true,  acc: false, per: true,  single: true,  baby: false },
  { id: "main", b: "Old Main",                  f: "1st floor", x: 226, y: 354, all: false, acc: true,  per: false, single: false, baby: false },
  { id: "asfc", b: "Alumni Sports & Fitness",   f: "Lobby",     x: 326, y: 28,  all: true,  acc: true,  per: true,  single: true,  baby: true },
  { id: "weis", b: "Weis Hall",                 f: "Commons",   x: 338, y: 156, all: true,  acc: true,  per: true,  single: false, baby: false },
  { id: "ware", b: "Ware Commons (North Ben)",  f: "Ground floor", x: 116, y: 150, all: false, acc: true,  per: true,  single: false, baby: false },
];

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
  const h = 3600e3;
  const now = Date.now();
  return {
    scc1: { clean: 3, supplies: 1, ok: 0, ts: now - 0.5 * h },
    lib1: { clean: 0, supplies: 2, ok: 1, ts: now - 1.2 * h },
    asfc: { clean: 1, supplies: 0, ok: 2, ts: now - 3 * h },
    stag: { clean: 2, supplies: 0, ok: 0, ts: now - 0.8 * h },
  };
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
    reports: seedReports(),
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
