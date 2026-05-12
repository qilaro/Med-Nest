"use client";

import Link from "next/link";
import { DrugSummary } from "../../types/drug";
import { Card, CardContent } from "../ui/card";
import { getDosageIcon } from "@/components/dosage-icons";

interface DrugCardProps {
  drug: DrugSummary;
}

const getDosageLabel = (form: string) => {
  const f = form.toLowerCase();
  if (f.includes("tablet")) return "Tab";
  if (f.includes("capsule")) return "Cap";
  if (f.includes("syrup")) return "Syr";
  if (f.includes("suspension")) return "Susp";
  if (f.includes("drop")) return "Drop";
  if (f.includes("injection")) return "Inj";
  if (f.includes("sachet")) return "Sach";
  return f.split(' ')[0];
};

export default function DrugCard({ drug }: DrugCardProps) {
  return (
    <Link href={`/drugs/${drug.slug}`} className="block group">
      <Card className="h-full transition-all duration-300 hover:border-teal-300 hover:shadow-[0_8px_25px_-5px_rgba(0,150,136,0.2)] overflow-hidden bg-white shadow-md border border-gray-100 hover:-translate-y-0.5">
        <CardContent className="p-4 flex items-start gap-4">
          {/* Icon */}
          <div className="flex flex-col items-center gap-1 shrink-0 w-14">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center text-teal-600 group-hover:from-teal-100 group-hover:to-teal-200 group-hover:text-teal-700 transition-all duration-300 shadow-sm">
              {(() => { const Icon = getDosageIcon(drug.dosageForm); return <Icon className="w-6 h-6" />; })()}
            </div>
            <span className="text-[10px] font-bold text-teal-600/70 uppercase tracking-wider">
              {getDosageLabel(drug.dosageForm)}
            </span>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            {/* Brand name + Rating */}
            <div className="flex justify-between items-start gap-2">
              <h3
                title={drug.brandName}
                className="font-bold text-gray-800 group-hover:text-teal-700 transition-colors text-base leading-tight truncate"
              >
                {drug.brandName}
              </h3>
              {drug.averageRating !== undefined && (
                <span className="shrink-0 text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60 flex items-center gap-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="#D97706" stroke="#D97706" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  {drug.averageRating.toFixed(1)}
                </span>
              )}
            </div>

            {/* Generic Name */}
            <p className="text-sm text-gray-500 truncate mt-0.5">
              {drug.genericName}
            </p>

            {/* Company Name */}
            {drug.company && (
              <p className="text-[11px] text-gray-400 truncate font-medium mt-0.5">
                {drug.company}
              </p>
            )}

            {/* Strength + Price */}
            <div className="flex items-center justify-between mt-2">
              {drug.strength && (
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100/60">
                  {drug.strength}
                </span>
              )}
              {!drug.strength && <span />}
              {drug.price && (
                <span className="text-sm font-bold text-gray-800">
                  <span className="text-teal-600">৳</span> {drug.price}
                </span>
              )}
            </div>

            {/* Drug Class */}
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mt-2">
              {drug.drugClass}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
