/**
 * DEMO MODE authentication.
 * Accounts live in AsyncStorage on the device only. Passwords are hashed
 * with a non-cryptographic hash purely to avoid storing plaintext in demo
 * data — this is NOT a secure auth implementation and is replaced by the
 * FastAPI backend in "api" mode.
 */
import { readJson, writeJson } from '@/services/storage';
import type { AuthService, AuthSession, User } from '@/types';
import { AppError } from '@/types';

const USERS_KEY = 'cocoscan.demo.users';

interface DemoUserRecord extends User {
  passwordHash: string;
}

/** Pre-seeded demo account so the full flow can be tested immediately. */
export const DEMO_ACCOUNT = { email: 'demo@cocoscan.app', password: 'cocoscan123', name: 'Chlyde Christian' };

function simpleHash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return `demo$${(h >>> 0).toString(16)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function nameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'Farmer';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

async function loadUsers(): Promise<DemoUserRecord[]> {
  const users = await readJson<DemoUserRecord[]>(USERS_KEY, []);
  if (!users.some((u) => u.email === DEMO_ACCOUNT.email)) {
    users.push({
      id: 'demo-user-1',
      email: DEMO_ACCOUNT.email,
      name: DEMO_ACCOUNT.name,
      createdAt: new Date().toISOString(),
      passwordHash: simpleHash(DEMO_ACCOUNT.password),
    });
    await writeJson(USERS_KEY, users);
  }
  return users;
}

function toSession(u: DemoUserRecord): AuthSession {
  const { passwordHash: _ignored, ...user } = u;
  return { token: `demo-token-${u.id}`, user };
}

export function userIdFromDemoToken(token: string): string | null {
  return token.startsWith('demo-token-') ? token.slice('demo-token-'.length) : null;
}

export const demoAuthService: AuthService = {
  async register(email, password, name) {
    await delay(500);
    const users = await loadUsers();
    const normalized = email.trim().toLowerCase();
    if (users.some((u) => u.email === normalized)) {
      throw new AppError('An account with this email already exists.', 'validation', 409);
    }
    const record: DemoUserRecord = {
      id: `demo-user-${Date.now()}`,
      email: normalized,
      name: name?.trim() || nameFromEmail(normalized),
      createdAt: new Date().toISOString(),
      passwordHash: simpleHash(password),
    };
    users.push(record);
    await writeJson(USERS_KEY, users);
    return toSession(record);
  },

  async login(email, password) {
    await delay(500);
    const users = await loadUsers();
    const normalized = email.trim().toLowerCase();
    const found = users.find((u) => u.email === normalized);
    if (!found || found.passwordHash !== simpleHash(password)) {
      throw new AppError('Incorrect email or password.', 'auth', 401);
    }
    return toSession(found);
  },

  async me(token) {
    const id = userIdFromDemoToken(token);
    const users = await loadUsers();
    const found = users.find((u) => u.id === id);
    if (!found) throw new AppError('Session expired. Please log in again.', 'auth', 401);
    return toSession(found).user;
  },

  async logout() {
    await delay(150);
  },
};
