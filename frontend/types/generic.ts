export interface GenericSummary {
  id: string;
  name: string;
  slug: string;
  therapeuticClass: string | null;
  brandCount: number;
  avgRating: number;
  minPrice: number | null;
  maxPrice: number | null;
  hasMedicalInfo: boolean;
  medicineType: string | null;
}

export interface GenericsResponse {
  generics: GenericSummary[];
  total: number;
  page: number;
  totalPages: number;
}
