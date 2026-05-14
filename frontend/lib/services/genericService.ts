import { GenericSummary, GenericsResponse } from '@/types/generic';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export interface GenericsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  medicine_type?: string;
  drug_class?: string;
  dosage_form?: string;
  rating?: string;
  letter?: string;
}

async function getGenerics(params: GenericsQueryParams = {}): Promise<GenericsResponse> {
  const p = new URLSearchParams();
  if (params.page) p.set('page', String(params.page));
  if (params.search) p.set('search', params.search);
  if (params.medicine_type) p.set('medicine_type', params.medicine_type);
  if (params.drug_class) p.set('drug_class', params.drug_class);
  if (params.dosage_form) p.set('dosage_form', params.dosage_form);
  if (params.rating) p.set('rating', params.rating);
  if (params.letter) p.set('letter', params.letter);
  const qs = p.toString();
  return apiFetch<GenericsResponse>(`/api/generics${qs ? `?${qs}` : ''}`);
}

async function getGenericClasses(): Promise<{ name: string; count: number }[]> {
  return apiFetch<{ name: string; count: number }[]>('/api/generic-classes');
}

async function getDosageForms(): Promise<{ name: string; count: number }[]> {
  return apiFetch<{ name: string; count: number }[]>('/api/dosage-forms');
}

async function searchGenerics(query: string): Promise<{ results: GenericSummary[]; total: number }> {
  return apiFetch<{ results: GenericSummary[]; total: number }>(`/api/search/generics?q=${encodeURIComponent(query)}`);
}

export const genericService = { getGenerics, getGenericClasses, getDosageForms, searchGenerics };
