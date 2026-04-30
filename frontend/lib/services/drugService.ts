import { 
  DrugSummary, 
  DrugDetail, 
  DrugAZResponse, 
  DrugClass 
} from "../../types/drug";
import Fuse from "fuse.js";
import drugsData from "../../public/data/drugs.json";

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
  getDrugs: async (params?: { page?: number; limit?: number; drug_class?: string; letter?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.drug_class) q.set("drug_class", params.drug_class);
    if (params?.letter) q.set("letter", params.letter);
    
    try {
      const data = await apiFetch<DrugsResponse>(`/drugs?${q}`);
      if (data.drugs.length === 0) {
        throw new Error("Empty API response");
      }
      return data;
    } catch (error) {
      console.warn("API unavailable or empty, falling back to local mock data.");
      
      let drugs = [...drugsData.drugs];
      if (params?.drug_class) {
        drugs = drugs.filter((d: any) => d.drugClass === params.drug_class);
      }
      if (params?.letter) {
        if (params.letter === "0-9") {
          drugs = drugs.filter((d: any) => /^[0-9]/.test(d.brandName));
        } else {
          drugs = drugs.filter((d: any) => d.brandName.toUpperCase().startsWith(params.letter!.toUpperCase()));
        }
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
      const drugs = drugsData.drugs;
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
      const classes: Record<string, number> = {};
      drugsData.drugs.forEach((d: any) => {
        classes[d.drugClass] = (classes[d.drugClass] || 0) + 1;
      });
      
      return Object.entries(classes).map(([name, count]) => ({ name, count }));
    }
  },

  /**
   * Get all companies
   */
  getCompanies: async (): Promise<string[]> => {
    try {
      return await apiFetch<string[]>("/drugs/companies");
    } catch (error) {
      const companies = Array.from(new Set(drugsData.drugs.map((d: any) => d.company))).sort() as string[];
      return companies;
    }
  },

  /**
   * Get a single drug by its slug
   */
  getDrugBySlug: async (slug: string): Promise<DrugDetail> => {
    try {
      const res = await fetch(`${API_BASE}/drugs/${slug}`);
      if (res.ok) {
        return await res.json();
      }
      throw new Error(`API returned ${res.status}`);
    } catch (error) {
      console.warn(`API fetch for ${slug} failed, falling back to local mock data.`);
      const drug = drugsData.drugs.find((d: any) => d.slug === slug);
      if (!drug) {
        console.error(`Drug with slug '${slug}' not found in local data.`);
        throw new Error("Drug not found");
      }
      return drug as unknown as DrugDetail;
    }
  },

  /**
   * Search for drugs with fuzzy matching
   */
  searchDrugs: async (query: string) => {
    try {
      return await apiFetch<{ results: any[]; total: number }>(`/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      const fuse = new Fuse(drugsData.drugs, {
        keys: [
          { name: "brandName", weight: 2 },
          { name: "genericName", weight: 1 },
          { name: "drugClass", weight: 0.5 },
          { name: "company", weight: 0.5 }
        ],
        threshold: 0.5, 
        minMatchCharLength: 1, 
        shouldSort: true
      });
      const results = fuse.search(query).map(r => r.item);
      return { results, total: results.length };
    }
  }
};
