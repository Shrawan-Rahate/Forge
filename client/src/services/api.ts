// Base fetch wrapper that attaches the stored JWT and handles JSON parsing.

const API_BASE = '/api/v1';

function getToken(): string | null {
  return localStorage.getItem('forge_token');
}

export function setToken(token: string): void {
  localStorage.setItem('forge_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('forge_token');
}

export function hasToken(): boolean {
  return !!getToken();
}

interface RequestOptions extends RequestInit {
  auth?: boolean; // attach Authorization header (default: true)
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> | undefined),
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  const json = await res.json();

  if (!res.ok) {
    const message = (json as { message?: string }).message ?? 'Request failed';
    throw new Error(message);
  }

  return json as T;
}
