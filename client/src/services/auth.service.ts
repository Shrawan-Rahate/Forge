import { apiFetch, setToken } from './api';
import type { ApiSuccess, User } from '../types/api';

interface LoginPayload {
  email: string;
  password: string;
}

// Backend login returns { user, token } inside data
interface LoginData {
  user: User;
  token: string;
}

export async function login(payload: LoginPayload): Promise<User> {
  const res = await apiFetch<ApiSuccess<LoginData>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: false,
  });
  setToken(res.data.token);
  return res.data.user;
}

export async function getMe(): Promise<User> {
  const res = await apiFetch<ApiSuccess<{ user: User }>>('/auth/me');
  return res.data.user;
}
