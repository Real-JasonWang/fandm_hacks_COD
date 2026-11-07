import type { CheckInEntry } from '../types';
import { seedLogs } from '../data/appleData';

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
    ],
  },
];

export interface UserAccount {
  id: string;
  email: string;
  displayName: string;
  universityId: string;
  houseId: string;
  passwordHash: string;
  createdAt: number;
  logs: CheckInEntry[];
  streak: number;
  totalPoints: number;
}

const USERS_DB_KEY = 'cod_users_database_v2';
const CURRENT_SESSION_KEY = 'cod_active_session_v2';
const SESSION_COOKIE_NAME = 'cod_user_session_id';

// Cookie helpers for cross-tab and private browsing session persistence
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

// SHA-256 password hash using standard Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return 'hashed_' + btoa(password);
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_salt_cod_2026');
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Database helper: Read users table
export function getAllUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read users database:', err);
  }
  // Initialize with F&M seed accounts
  const seedUsers: UserAccount[] = [
    {
      id: 'user_fandm_demo',
      email: 'diplomat@fandm.edu',
      displayName: 'Franklin Diplomat',
      universityId: 'fandm',
      houseId: 'Ware',
      passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // 'admin123'
      createdAt: Date.now() - 14 * 864e5,
      logs: seedLogs(),
      streak: 7,
      totalPoints: 120,
    },
    {
      id: 'user_fandm_ben',
      email: 'ben@fandm.edu',
      displayName: 'Ben Franklin',
      universityId: 'fandm',
      houseId: 'Bonchek',
      passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
      createdAt: Date.now() - 7 * 864e5,
      logs: seedLogs(),
      streak: 4,
      totalPoints: 75,
    },
  ];
  saveAllUsers(seedUsers);
  return seedUsers;
}

export function saveAllUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users database:', err);
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

  // Basic regex check before @
  const parts = trimmed.split('@');
  if (parts.length !== 2 || parts[0].length < 2) {
    return { isValid: false, error: 'Please enter a valid Franklin & Marshall student username before @fandm.edu.' };
  }

  return { isValid: true };
}

// Register a real new account
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

  // 4. Hash password and persist user
  const passwordHash = await hashPassword(password);
  const newUser: UserAccount = {
    id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    email: cleanEmail,
    displayName: displayName?.trim() || cleanEmail.split('@')[0],
    universityId: 'fandm',
    houseId,
    passwordHash,
    createdAt: Date.now(),
    logs: seedLogs(),
    streak: 1,
    totalPoints: 10,
  };

  users.push(newUser);
  saveAllUsers(users);

  // Set current session
  setCurrentSession(newUser);

  return { success: true, user: newUser };
}

// Login
export async function loginAccount(
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const users = getAllUsers();
  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return { success: false, error: 'No registered F&M student account found with this email address.' };
  }

  const hash = await hashPassword(password);
  if (user.passwordHash !== hash) {
    return { success: false, error: 'Incorrect password. Please verify and try again.' };
  }

  setCurrentSession(user);
  return { success: true, user };
}

// Session management
export function getCurrentSession(): UserAccount | null {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(CURRENT_SESSION_KEY) : null;
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
          localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(current));
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
        localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user));
      }
      setCookie(SESSION_COOKIE_NAME, user.id);
    } else {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(CURRENT_SESSION_KEY);
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

// Update current user's personal logs in database
export function updateUserLogs(userId: string, newLog: CheckInEntry): void {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index !== -1) {
    users[index].logs.push(newLog);
    users[index].totalPoints += 10 + (newLog.water >= 6 ? 5 : 0) + (newLog.sleep >= 7 ? 5 : 0);
    saveAllUsers(users);

    const activeSession = getCurrentSession();
    if (activeSession && activeSession.id === userId) {
      setCurrentSession(users[index]);
    }
  }
}
