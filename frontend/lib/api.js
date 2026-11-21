const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'srl_token';

export const tokenStore = {
  get: () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY)),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

/** fetch wrapper: adds JWT, parses JSON, throws Error(message) on failure */
export async function api(path, { method = 'GET', body, query } = {}) {
  const url = new URL(BASE + path);
  if (query) Object.entries(query).forEach(([k, v]) => v !== '' && v != null && url.searchParams.set(k, v));

  const headers = { 'Content-Type': 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error(`Cannot reach the API at ${BASE}. Is the backend running?`);
  }
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && token && path !== '/auth/login') {
    tokenStore.clear();
    if (typeof window !== 'undefined') window.location.href = '/login';
  }
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}
