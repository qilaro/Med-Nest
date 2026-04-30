"use client";

import Link from "next/link";
import { DrugSummary } from "../../types/drug";
import { Card, CardContent } from "../ui/card";
import StarRating from "../ui/StarRating";
import { 
  TabletIcon, 
  PillIcon, 
  SyrupIcon, 
  IVDripIcon, 
  DropsIcon, 
  InhalerIcon 
} from "@/components/ui/MedicalIcons";

interface DrugCardProps {
  drug: DrugSummary;
}

const getDosageIcon = (form: string) => {
  const f = form.toLowerCase();
  if (f.includes("tablet")) return <TabletIcon size={24} />;
  if (f.includes("capsule")) return <PillIcon size={24} />;
  if (f.includes("syrup") || f.includes("suspension")) return <SyrupIcon size={24} />;
  if (f.includes("drop")) return <DropsIcon size={24} />;
  if (f.includes("injection") || f.includes("infusion")) return <IVDripIcon size={24} />;
  if (f.includes("inhaler")) return <InhalerIcon size={24} />;
  return <PillIcon size={24} />;
};

const getDosageLabel = (form: string) => {
  const f = form.toLowerCase();
  if (f.includes("tablet")) return "Tab";
  if (f.includes("capsule")) return "Cap";
  if (f.includes("syrup")) return "Syr";
  if (f.includes("suspension")) return "Susp";
  if (f.includes("drop")) return "Drop";
  if (f.includes("injection")) return "Inj";
  if (f.includes("sachet")) return "Sach";
  return f.split(' ')[0]; // Fallback to first word
};

/**
 * DrugCard component for displaying medication summaries in a grid.
 * Uses shadcn/ui Card for the frame and themed Tailwind classes.
 */
export default function DrugCard({ drug }: DrugCardProps) {
  return (
    <Link href={`/drugs/${drug.slug}`} className="block group">
      <Card className="h-full transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden">
        <CardContent className="p-4 flex items-start gap-4">
          {/* Icon Container with Branding Colors */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div 
              className="w-12 h-12 rounded-xl bg-mint-soft flex items-center justify-center transition-colors group-hover:bg-primary/10 text-primary"
              aria-hidden="true"
            >
              {getDosageIcon(drug.dosageForm)}
            </div>
            <span className="text-[10px] font-bold text-primary/70 uppercase">
              {getDosageLabel(drug.dosageForm)}
            </span>
          </div>

          {/* Medication Info */}
          <div className="min-w-0 flex-1">
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-bold text-navy group-hover:text-primary transition-colors truncate text-lg leading-tight">
                {drug.brandName}
              </h3>
              {drug.averageRating !== undefined && (
                <div className="flex items-center gap-1 shrink-0 bg-yellow-50 px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-700 border border-yellow-100">
                  {drug.averageRating.toFixed(1)}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate italic">
              {drug.genericName}
            </p>
            {drug.company && (
              <p className="text-[11px] text-muted-foreground truncate font-medium">
                {drug.company}
              </p>
            )}
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                {drug.drugClass}
              </p>
              <div className="flex flex-col items-end gap-1">
                <p className="text-sm font-bold text-navy">{drug.price}</p>
                {drug.averageRating !== undefined && (
                  <StarRating rating={drug.averageRating} size="sm" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
