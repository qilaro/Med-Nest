export interface DrugSummary {
  id: number;
  slug: string;
  brandName: string;
  genericName: string;
  dosageForm: string;
  strength: string;
  drugClass: string;
  company?: string;
  price?: string;
  imageUrl?: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface DrugDetail extends DrugSummary {
  imageBoxUrl?: string;
  imageStripUrl?: string;
  description?: string;
  indications?: string;
  warnings?: string;
  dosage?: string;
  sideEffects?: string;
  interactions?: string;
  faqs?: { question: string; answer: string }[];
  disclaimer?: string;
  createdAt?: string;
  updatedAt?: string;
  pronunciation?: string;
  // Bangladesh-specific fields
  fixedMarketPrice?: number;
  availabilityInBD?: boolean;
  brandName_bn?: string;
  bmDcVerificationLink?: string;
}

export interface DrugAZGroup {
  letter: string;
  drugs: DrugSummary[];
}

export interface DrugAZResponse {
  groups: DrugAZGroup[];
}

export interface DrugClass {
  name: string;
  count: number;
}
