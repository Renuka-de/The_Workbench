import type { AuthSession, User } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('vms_token');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message ?? 'Request failed');
  }

  return payload.data as T;
}

export async function loginUser(email: string, password: string): Promise<AuthSession> {
  const payload = await apiRequest<{ user: User; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  return {
    user: payload.user,
    token: payload.token,
  };
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
  role: User['role'];
}): Promise<AuthSession> {
  const payload = await apiRequest<{ user: User; token: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return {
    user: payload.user,
    token: payload.token,
  };
}

export async function getCurrentUser(): Promise<User> {
  const payload = await apiRequest<{ user: User }>('/auth/me');
  return payload.user;
}
