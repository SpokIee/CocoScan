import { request } from '@/services/api/client';
import type { AuthService, AuthSession, User } from '@/types';

interface ApiUser {
  id: number;
  email: string;
  name: string | null;
  created_at: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

function mapUser(u: ApiUser): User {
  return { id: String(u.id), email: u.email, name: u.name, createdAt: u.created_at };
}

export const apiAuthService: AuthService = {
  async register(email, password, name) {
    const res = await request<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, confirm_password: password, name: name ?? null }),
    });
    return { token: res.access_token, user: mapUser(res.user) };
  },

  async login(email, password) {
    const res = await request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return { token: res.access_token, user: mapUser(res.user) };
  },

  async me(token) {
    const u = await request<ApiUser>('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
    return mapUser(u);
  },

  async logout() {
    try {
      await request<void>('/auth/logout', { method: 'POST' });
    } catch {
      // Token is discarded client-side regardless.
    }
  },
};
