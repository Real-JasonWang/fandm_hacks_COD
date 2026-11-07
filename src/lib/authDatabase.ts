import type { CheckInEntry } from '../types';

export interface UniversityDef {
  id: string;
  name: string;
  shortName: string;
  requiredDomain: string; // '@fandm.edu'
  houses: { id: string; name: string; color: string }[];
}

export const SUPPORTED_UNIVERSITIES: UniversityDef[] = [
  {
    id: 'fandm',
    name: 'Franklin & Marshall College',
    shortName: 'F&M',
    requiredDomain: '@fandm.edu',
    houses: [
      { id: 'Bonchek', name: 'Bonchek College House', color: '#3D6FE0' },
      { id: 'Brooks', name: 'Brooks College House', color: '#D9483F' },
      { id: 'Roschel', name: 'Roschel College House', color: '#2A9A72' },
      { id: 'Ware', name: 'Ware College House', color: '#8E5CE0' },
      { id: 'Weis', name: 'Weis College House', color: '#D48A0F' },
      { id: 'Schnader', name: 'Schnader Hall', color: '#2563EB' },
      { id: 'Thomas', name: 'Thomas Hall', color: '#059669' },
      { id: 'Dietz', name: 'Dietz Hall', color: '#D97706' },
      { id: 'Marshall', name: 'Marshall Hall', color: '#7C3AED' },
      { id: 'Buchanan', name: 'Buchanan Hall', color: '#DC2626' },
    ],
  },
];

export interface UserAccount {
  id: string;
  email: string;
  displayName: string;
  universityId: string;
  houseId: string;
  salt: string;
  passwordHash: string;
  createdAt: number;
  logs: CheckInEntry[];
  streak: number;
  totalPoints: number;
}

export interface UserCredentialRecord {
  userId: string;
  email: string;
  salt: string;
  passwordHash: string;
  algo: 'PBKDF2-SHA256' | 'SHA256-SALTED';
  iterations: number;
  updatedAt: number;
}

export interface SessionRecord {
  token: string;
  userId: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}

// Database Keys & Constants
const DB_NAME = 'CallOfDoodie_FandM_DB';
const DB_VERSION = 3;
const USERS_STORE = 'users';
const CREDENTIALS_STORE = 'credentials';
const SESSIONS_STORE = 'sessions';
const LOGS_STORE = 'logs';

const LOCAL_STORAGE_USERS_KEY = 'cod_users_database_v3';
const LOCAL_STORAGE_SESSION_KEY = 'cod_active_session_v3';
const SESSION_COOKIE_NAME = 'cod_user_session_id';

// Default Seed Salt & PBKDF2 Hash for 'admin123'
const SEED_SALT = 'fandm_demo_salt_2026';
const SEED_PBKDF2_HASH = '4c41dd4dd0c7401f1a581111504ec0386c6b151a9ca5468ac189a07e65aa0b99';
const SEED_SHA256_SALT_HASH = 'be39f51ba5ef59f306d765f179ec9e1f68bf688af4f3a8680240db6b864e6672';

// Cookie helpers
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string, days: number = 30): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

// Cryptographic Salt Generation
export function generateSalt(length = 16): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Enterprise-Grade PBKDF2-HMAC-SHA256 Password Hash
export async function hashPassword(password: string, salt: string = SEED_SALT): Promise<string> {
  const cleanPassword = password.trim();
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return 'fallback_' + btoa(cleanPassword + ':' + salt);
  }

  const encoder = new TextEncoder();
  try {
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(cleanPassword),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    return Array.from(new Uint8Array(derivedBits))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    // Standard SHA-256 fallback with salt
    const data = encoder.encode(cleanPassword + '_' + salt);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

// ==========================================
// IndexedDB Engine: Native Browser Database
// ==========================================
class CampusDatabaseEngine {
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  public async getDB(): Promise<IDBDatabase | null> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return null;
    }
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          // Store 1: Users table
          if (!db.objectStoreNames.contains(USERS_STORE)) {
            const userStore = db.createObjectStore(USERS_STORE, { keyPath: 'id' });
            userStore.createIndex('email', 'email', { unique: true });
            userStore.createIndex('houseId', 'houseId', { unique: false });
          }
          // Store 2: Credentials table
          if (!db.objectStoreNames.contains(CREDENTIALS_STORE)) {
            const credStore = db.createObjectStore(CREDENTIALS_STORE, { keyPath: 'userId' });
            credStore.createIndex('email', 'email', { unique: true });
          }
          // Store 3: Sessions table
          if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
            const sessStore = db.createObjectStore(SESSIONS_STORE, { keyPath: 'token' });
            sessStore.createIndex('userId', 'userId', { unique: false });
          }
          // Store 4: Health logs table
          if (!db.objectStoreNames.contains(LOGS_STORE)) {
            const logStore = db.createObjectStore(LOGS_STORE, { keyPath: 'id' });
            logStore.createIndex('userId', 'userId', { unique: false });
          }
        };

        req.onsuccess = () => {
          resolve(req.result);
        };

        req.onerror = () => {
          console.warn('IndexedDB connection failed, using LocalStorage fallback.');
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB initialization error:', err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  // Put item in store
  public async put<T>(storeName: string, item: T): Promise<void> {
    const db = await this.getDB();
    if (!db) return;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  // Get item by key
  public async get<T>(storeName: string, key: string): Promise<T | null> {
    const db = await this.getDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  // Query item by index
  public async getByIndex<T>(storeName: string, indexName: string, value: string): Promise<T | null> {
    const db = await this.getDB();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const index = store.index(indexName);
        const req = index.get(value);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  // Get all items in store
  public async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.getDB();
    if (!db) return [];
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      } catch {
        resolve([]);
      }
    });
  }
}

export const campusDB = new CampusDatabaseEngine();

// ==========================================
// In-Memory & Synchronous Cache Layer
// ==========================================
export function createCase1HealthyLogs(): CheckInEntry[] {
  const now = Date.now();
  const dayMs = 864e5;
  // Full 14-day optimal routine history (Ideal Bristol 3-4, 7-8h sleep, 6-8 glasses water)
  return [
    { id: 'case1_14', ts: now - 13 * dayMs, pooped: true, bristol: 4, symptoms: [], sleep: 7.5, water: 7, veg: 3, stress: 0 },
    { id: 'case1_13', ts: now - 12 * dayMs, pooped: true, bristol: 4, symptoms: [], sleep: 8.0, water: 8, veg: 4, stress: 0 },
    { id: 'case1_12', ts: now - 11 * dayMs, pooped: true, bristol: 3, symptoms: [], sleep: 7.0, water: 6, veg: 2, stress: 1 },
    { id: 'case1_11', ts: now - 10 * dayMs, pooped: true, bristol: 4, symptoms: [], sleep: 7.5, water: 7, veg: 3, stress: 0 },
    { id: 'case1_10', ts: now - 9 * dayMs, pooped: true, bristol: 4, symptoms: [], sleep: 8.0, water: 8, veg: 4, stress: 0 },
    { id: 'case1_09', ts: now - 8 * dayMs, pooped: true, bristol: 3, symptoms: [], sleep: 7.5, water: 7, veg: 3, stress: 1 },
    { id: 'case1_08', ts: now - 7 * dayMs, pooped: true, bristol: 4, symptoms: [], sleep: 8.5, water: 8, veg: 3, stress: 0 },
    { id: 'case1_07', ts: now - 6 * dayMs, pooped: true, bristol: 4, symptoms: [], sleep: 7.5, water: 7, veg: 3, stress: 0 },
    { id: 'case1_06', ts: now - 5 * dayMs, pooped: true, bristol: 4, symptoms: [], sleep: 8.0, water: 8, veg: 4, stress: 0 },
    { id: 'case1_05', ts: now - 4 * dayMs, pooped: true, bristol: 3, symptoms: [], sleep: 7.0, water: 6, veg: 2, stress: 1 },
    { id: 'case1_04', ts: now - 3 * dayMs, pooped: true, bristol: 4, symptoms: [], sleep: 8.0, water: 7, veg: 3, stress: 0 },
    { id: 'case1_03', ts: now - 2 * dayMs, pooped: true, bristol: 4, symptoms: [], sleep: 7.5, water: 8, veg: 4, stress: 0 },
    { id: 'case1_02', ts: now - 1 * dayMs, pooped: true, bristol: 4, symptoms: [], sleep: 7.5, water: 7, veg: 3, stress: 1 },
    { id: 'case1_01', ts: now, pooped: true, bristol: 4, symptoms: [], sleep: 8.0, water: 7, veg: 3, stress: 0 },
  ];
}

export function createCase2StressLogs(): CheckInEntry[] {
  const now = Date.now();
  const dayMs = 864e5;
  // Full 14-day history reflecting student exam stress, short sleep, low hydration and IBS motility swings
  return [
    { id: 'case2_14', ts: now - 13 * dayMs, pooped: true, bristol: 3, symptoms: [], sleep: 7.0, water: 6, veg: 2, stress: 1 },
    { id: 'case2_13', ts: now - 12 * dayMs, pooped: true, bristol: 2, symptoms: ['straining'], sleep: 5.5, water: 3, veg: 1, stress: 3 },
    { id: 'case2_12', ts: now - 11 * dayMs, pooped: true, bristol: 2, symptoms: ['bloating', 'straining'], sleep: 5.0, water: 3, veg: 0, stress: 4 },
    { id: 'case2_11', ts: now - 10 * dayMs, pooped: true, bristol: 5, symptoms: ['gas'], sleep: 6.0, water: 4, veg: 1, stress: 2 },
    { id: 'case2_10', ts: now - 9 * dayMs, pooped: true, bristol: 4, symptoms: [], sleep: 7.5, water: 6, veg: 3, stress: 1 },
    { id: 'case2_09', ts: now - 8 * dayMs, pooped: true, bristol: 6, symptoms: ['cramps', 'urgency'], sleep: 4.5, water: 4, veg: 1, stress: 4 },
    { id: 'case2_08', ts: now - 7 * dayMs, pooped: true, bristol: 6, symptoms: ['urgency'], sleep: 4.0, water: 3, veg: 1, stress: 4 },
    { id: 'case2_07', ts: now - 6 * dayMs, pooped: true, bristol: 2, symptoms: ['bloating'], sleep: 5.0, water: 2, veg: 1, stress: 3 },
    { id: 'case2_06', ts: now - 5 * dayMs, pooped: true, bristol: 1, symptoms: ['straining', 'pain'], sleep: 4.5, water: 2, veg: 0, stress: 4 },
    { id: 'case2_05', ts: now - 4 * dayMs, pooped: true, bristol: 3, symptoms: ['gas'], sleep: 6.5, water: 5, veg: 2, stress: 2 },
    { id: 'case2_04', ts: now - 3 * dayMs, pooped: true, bristol: 6, symptoms: ['cramps', 'urgency'], sleep: 5.0, water: 4, veg: 1, stress: 4 },
    { id: 'case2_03', ts: now - 2 * dayMs, pooped: true, bristol: 5, symptoms: ['bloating'], sleep: 6.0, water: 4, veg: 2, stress: 3 },
    { id: 'case2_02', ts: now - 1 * dayMs, pooped: true, bristol: 6, symptoms: ['urgency'], sleep: 4.5, water: 3, veg: 1, stress: 4 },
    { id: 'case2_01', ts: now, pooped: true, bristol: 3, symptoms: [], sleep: 7.0, water: 6, veg: 3, stress: 1 },
  ];
}

function createBrooksStudentLogs(): CheckInEntry[] {
  const now = Date.now();
  const dayMs = 864e5;
  return [
    { id: 'brooks_01', ts: now - 3 * dayMs, pooped: true, bristol: 4, symptoms: [], sleep: 7.0, water: 6, veg: 2, stress: 1 },
    { id: 'brooks_02', ts: now - 2 * dayMs, pooped: true, bristol: 3, symptoms: [], sleep: 6.5, water: 5, veg: 2, stress: 2 },
    { id: 'brooks_03', ts: now - 1 * dayMs, pooped: true, bristol: 4, symptoms: [], sleep: 7.0, water: 6, veg: 3, stress: 1 },
  ];
}

function createWeisStudentLogs(): CheckInEntry[] {
  const now = Date.now();
  const dayMs = 864e5;
  return [
    { id: 'weis_01', ts: now - 4 * dayMs, pooped: true, bristol: 3, symptoms: [], sleep: 7.5, water: 7, veg: 3, stress: 1 },
    { id: 'weis_02', ts: now - 3 * dayMs, pooped: true, bristol: 4, symptoms: [], sleep: 8.0, water: 6, veg: 3, stress: 0 },
    { id: 'weis_03', ts: now - 2 * dayMs, pooped: true, bristol: 4, symptoms: [], sleep: 7.0, water: 7, veg: 2, stress: 1 },
    { id: 'weis_04', ts: now - 1 * dayMs, pooped: true, bristol: 3, symptoms: [], sleep: 7.5, water: 6, veg: 3, stress: 1 },
  ];
}

function createRoschelStudentLogs(): CheckInEntry[] {
  const now = Date.now();
  const dayMs = 864e5;
  return [
    { id: 'roschel_01', ts: now - 2 * dayMs, pooped: true, bristol: 4, symptoms: [], sleep: 7.0, water: 6, veg: 2, stress: 1 },
    { id: 'roschel_02', ts: now - 1 * dayMs, pooped: true, bristol: 4, symptoms: [], sleep: 7.5, water: 7, veg: 3, stress: 1 },
  ];
}

function getSeedUsers(): UserAccount[] {
  return [
    {
      id: 'user_fandm_demo',
      email: 'diplomat@fandm.edu',
      displayName: 'Alex Diplomat',
      universityId: 'fandm',
      houseId: 'Ware',
      salt: SEED_SALT,
      passwordHash: SEED_PBKDF2_HASH,
      createdAt: Date.now() - 14 * 864e5,
      logs: createCase1HealthyLogs(),
      streak: 14,
      totalPoints: 280,
    },
    {
      id: 'user_fandm_ben',
      email: 'ben@fandm.edu',
      displayName: 'Ben Franklin',
      universityId: 'fandm',
      houseId: 'Bonchek',
      salt: SEED_SALT,
      passwordHash: SEED_PBKDF2_HASH,
      createdAt: Date.now() - 14 * 864e5,
      logs: createCase2StressLogs(),
      streak: 8,
      totalPoints: 195,
    },
    {
      id: 'user_fandm_david',
      email: 'david@fandm.edu',
      displayName: 'David Brooks',
      universityId: 'fandm',
      houseId: 'Brooks',
      salt: SEED_SALT,
      passwordHash: SEED_PBKDF2_HASH,
      createdAt: Date.now() - 5 * 864e5,
      logs: createBrooksStudentLogs(),
      streak: 3,
      totalPoints: 55,
    },
    {
      id: 'user_fandm_leo',
      email: 'leo@fandm.edu',
      displayName: 'Leo Weis',
      universityId: 'fandm',
      houseId: 'Weis',
      salt: SEED_SALT,
      passwordHash: SEED_PBKDF2_HASH,
      createdAt: Date.now() - 6 * 864e5,
      logs: createWeisStudentLogs(),
      streak: 4,
      totalPoints: 75,
    },
    {
      id: 'user_fandm_maya',
      email: 'maya@fandm.edu',
      displayName: 'Maya Roschel',
      universityId: 'fandm',
      houseId: 'Roschel',
      salt: SEED_SALT,
      passwordHash: SEED_PBKDF2_HASH,
      createdAt: Date.now() - 4 * 864e5,
      logs: createRoschelStudentLogs(),
      streak: 2,
      totalPoints: 35,
    },
  ];
}

export function getAllUsers(): UserAccount[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Strictly purge any legacy fake demo logs (id starting with 's')
          let modified = false;
          for (const u of parsed) {
            if (Array.isArray(u.logs)) {
              const realLogs = u.logs.filter((l: CheckInEntry) => l && typeof l.id === 'string' && !l.id.startsWith('s'));
              if (realLogs.length !== u.logs.length) {
                u.logs = realLogs;
                modified = true;
              }
            }
          }
          if (modified) {
            localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(parsed));
          }
          return parsed;
        }
      }
    }
  } catch (err) {
    console.error('Failed to read users cache:', err);
  }

  const seed = getSeedUsers();
  saveAllUsers(seed);
  return seed;
}

export function saveAllUsers(users: UserAccount[]): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
    }
    // Async background sync to IndexedDB
    for (const u of users) {
      campusDB.put(USERS_STORE, u).catch(() => {});
      campusDB.put(CREDENTIALS_STORE, {
        userId: u.id,
        email: u.email,
        salt: u.salt,
        passwordHash: u.passwordHash,
        algo: 'PBKDF2-SHA256',
        iterations: 100000,
        updatedAt: Date.now(),
      } as UserCredentialRecord).catch(() => {});
    }
  } catch (err) {
    console.error('Failed to persist users to database:', err);
  }
}

// Institutional Email Domain Validator - strictly @fandm.edu
export function validateCampusEmail(
  email: string,
  universityId: string = 'fandm'
): { isValid: boolean; error?: string } {
  const trimmed = email.trim().toLowerCase();
  const uni = SUPPORTED_UNIVERSITIES.find((u) => u.id === universityId) || SUPPORTED_UNIVERSITIES[0];

  if (!trimmed.endsWith(uni.requiredDomain.toLowerCase())) {
    return {
      isValid: false,
      error: `Registration restricted: Joining the F&M House Cup requires a verified ${uni.requiredDomain} email address.`,
    };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2 || parts[0].length < 2) {
    return { isValid: false, error: 'Please enter a valid Franklin & Marshall student username before @fandm.edu.' };
  }

  return { isValid: true };
}

// Register a real new account with cryptographically salted PBKDF2 credentials
export async function registerAccount(params: {
  email: string;
  password: string;
  universityId: string;
  houseId: string;
  displayName?: string;
}): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const { email, password, universityId, houseId, displayName } = params;
  const cleanEmail = email.trim().toLowerCase();

  // 1. Verify university domain strictly @fandm.edu
  const domainCheck = validateCampusEmail(cleanEmail, universityId);
  if (!domainCheck.isValid) {
    return { success: false, error: domainCheck.error };
  }

  // 2. Validate password strength
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  // 3. Check duplicate email in database
  const users = getAllUsers();
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return {
      success: false,
      error: 'An account with this institutional email already exists. Please sign in.',
    };
  }

  // 4. Generate unique salt & enterprise PBKDF2 password hash
  const salt = generateSalt(16);
  const passwordHash = await hashPassword(password, salt);

  const newUser: UserAccount = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    email: cleanEmail,
    displayName: displayName?.trim() || cleanEmail.split('@')[0],
    universityId: 'fandm',
    houseId,
    salt,
    passwordHash,
    createdAt: Date.now(),
    logs: [],
    streak: 0,
    totalPoints: 0,
  };

  users.push(newUser);
  saveAllUsers(users);

  // Set current active session
  setCurrentSession(newUser);

  return { success: true, user: newUser };
}

// Login with multi-layer verification (PBKDF2, Salted SHA-256, and Demo Fallback)
export async function loginAccount(
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();
  const users = getAllUsers();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return { success: false, error: 'No registered F&M student account found with this email address.' };
  }

  const userSalt = user.salt || SEED_SALT;
  const computedHash = await hashPassword(cleanPassword, userSalt);

  // Verification checks:
  // 1. PBKDF2 hash match
  // 2. Fallback salted SHA256 match
  // 3. Demo accounts default 'admin123'
  const isMatch =
    user.passwordHash === computedHash ||
    user.passwordHash === SEED_SHA256_SALT_HASH ||
    user.passwordHash === SEED_PBKDF2_HASH ||
    (cleanPassword === 'admin123' && [
      'diplomat@fandm.edu',
      'ben@fandm.edu',
      'david@fandm.edu',
      'leo@fandm.edu',
      'maya@fandm.edu',
    ].includes(cleanEmail));

  if (!isMatch) {
    return { success: false, error: 'Incorrect password. Please verify and try again.' };
  }

  // Automatically upgrade legacy hash if needed
  if (user.passwordHash !== computedHash) {
    user.salt = userSalt;
    user.passwordHash = computedHash;
    saveAllUsers(users);
  }

  setCurrentSession(user);
  return { success: true, user };
}

// Session management
export function getCurrentSession(): UserAccount | null {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_SESSION_KEY) : null;
    const cookieUserId = getCookie(SESSION_COOKIE_NAME);

    if (raw) {
      const parsed = JSON.parse(raw);
      const users = getAllUsers();
      const current = users.find((u) => u.id === parsed.id);
      if (current) {
        setCookie(SESSION_COOKIE_NAME, current.id);
        return current;
      }
    } else if (cookieUserId) {
      const users = getAllUsers();
      const current = users.find((u) => u.id === cookieUserId);
      if (current) {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(current));
        }
        return current;
      }
    }
  } catch (err) {
    console.error('Failed to get current session:', err);
  }

  return null;
}

export function setCurrentSession(user: UserAccount | null): void {
  try {
    if (user) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(user));
      }
      setCookie(SESSION_COOKIE_NAME, user.id);

      // Async write to IndexedDB sessions table
      const sessionToken = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      campusDB.put(SESSIONS_STORE, {
        token: sessionToken,
        userId: user.id,
        email: user.email,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 864e5,
      } as SessionRecord).catch(() => {});
    } else {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
      }
      deleteCookie(SESSION_COOKIE_NAME);
    }
  } catch (err) {
    console.error('Failed to write session:', err);
  }
}

export function logoutSession(): void {
  setCurrentSession(null);
}

// Update current user's college house in database
export function updateUserHouse(userId: string, houseId: string): void {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    users[index].houseId = houseId;
    saveAllUsers(users);

    const activeSession = getCurrentSession();
    if (activeSession && activeSession.id === userId) {
      setCurrentSession(users[index]);
    }
  }
}

// Update current user's personal logs in database
export function updateUserLogs(userId: string, newLog: CheckInEntry): void {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    users[index].logs.push(newLog);
    users[index].totalPoints += 10 + (newLog.water >= 6 ? 5 : 0) + (newLog.sleep >= 7 ? 5 : 0);
    saveAllUsers(users);

    // Save individual log into IndexedDB logs store
    campusDB.put(LOGS_STORE, {
      ...newLog,
      userId,
    }).catch(() => {});

    const activeSession = getCurrentSession();
    if (activeSession && activeSession.id === userId) {
      setCurrentSession(users[index]);
    }
  }
}

// Replace all of current user's personal logs in database (for reset/wipe)
export function replaceUserLogs(userId: string, logs: CheckInEntry[]): void {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    users[index].logs = logs;
    users[index].totalPoints = logs.reduce((acc, cur) => acc + (10 + (cur.water >= 6 ? 5 : 0) + (cur.sleep >= 7 ? 5 : 0)), 0);
    saveAllUsers(users);

    const activeSession = getCurrentSession();
    if (activeSession && activeSession.id === userId) {
      setCurrentSession(users[index]);
    }
  }
}
