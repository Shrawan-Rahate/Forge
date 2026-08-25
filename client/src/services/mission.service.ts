import { apiFetch } from './api';
import type { ApiSuccess, Mission } from '../types/api';

export async function getMissions(): Promise<Mission[]> {
  const res = await apiFetch<ApiSuccess<{ missions: Mission[] }>>('/missions');
  return res.data.missions;
}
