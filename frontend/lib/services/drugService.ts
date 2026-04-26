import { 
  DrugSummary, 
  DrugDetail, 
  DrugAZResponse, 
  DrugClass 
} from "../../types/drug";

// Add local interface for list response until types/drug.ts is updated
export interface DrugsResponse {
  drugs: DrugSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${res.status}`);
  }

  return res.json();
}

export const drugService = {
  /**
   * Get a list of drugs with optional filtering
   */
  getDrugs: async (params?: { page?: number; limit?: number; drug_class?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.drug_class) q.set("drug_class", params.drug_class);
    
    try {
      const data = await apiFetch<DrugsResponse>(`/drugs?${q}`);
      // If API succeeds but returns no drugs, fallback to local JSON for development
      if (data.drugs.length === 0) {
        throw new Error("Empty API response");
      }
      return data;
    } catch (error) {
      console.warn("API unavailable or empty, falling back to local mock data.");
      const response = await fetch("/data/drugs.json");
      const data = await response.json();
      
      let drugs = data.drugs;
      if (params?.drug_class) {
        drugs = drugs.filter((d: any) => d.drugClass === params.drug_class);
      }
      
      return {
        drugs: drugs,
        total: drugs.length,
        page: 1,
        limit: params?.limit || 50,
        totalPages: 1
      };
    }
  },

  /**
   * Get drugs grouped by A-Z
   */
  getDrugsAZ: async () => {
    try {
      return await apiFetch<DrugAZResponse>("/drugs/az");
    } catch (error) {
      const response = await fetch("/data/drugs.json");
      const data = await response.json();
      const drugs = data.drugs;
      
      const groups = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter => ({
        letter,
        drugs: drugs.filter((d: any) => d.brandName.startsWith(letter))
      })).filter(g => g.drugs.length > 0);
      
      return { groups };
    }
  },

  /**
   * Get all drug classes with counts
   */
  getDrugClasses: async () => {
    try {
      return await apiFetch<DrugClass[]>("/drugs/classes");
    } catch (error) {
      const response = await fetch("/data/drugs.json");
      const data = await response.json();
      const classes: Record<string, number> = {};
      
      data.drugs.forEach((d: any) => {
        classes[d.drugClass] = (classes[d.drugClass] || 0) + 1;
      });
      
      return Object.entries(classes).map(([name, count]) => ({ name, count }));
    }
  },

  /**
   * Get a single drug by its slug
   */
  getDrugBySlug: (slug: string) => {
    return apiFetch<DrugDetail>(`/drugs/${slug}`);
  },

  /**
   * Search for drugs
   */
  searchDrugs: (query: string) => {
    return apiFetch<{ results: any[]; total: number }>(`/search?q=${encodeURIComponent(query)}`);
  }
};
