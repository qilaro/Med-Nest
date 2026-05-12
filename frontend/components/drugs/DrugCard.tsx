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
      <Card className="relative h-full transition-all duration-300 hover:shadow-[0_12px_35px_-8px_rgba(0,0,0,0.12),0_4px_10px_-4px_rgba(0,150,136,0.15)] overflow-hidden bg-white border border-gray-200 hover:border-teal-300 hover:-translate-y-0.5 before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-r before:bg-teal-500 before:opacity-0 before:transition-all before:duration-300 group-hover:before:opacity-100 group-hover:before:inset-y-3">
        <CardContent className="p-4">
          {/* Top: Icon + Brand + Rating */}
          <div className="flex items-start gap-3.5">
            <div className="flex flex-col items-center gap-1 shrink-0 w-14">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-teal-600 shadow-sm group-hover:shadow-md group-hover:from-teal-200 group-hover:to-teal-300 group-hover:text-teal-700 group-hover:scale-105 transition-all duration-300">
                {(() => { const Icon = getDosageIcon(drug.dosageForm); return <Icon className="w-5 h-5" />; })()}
              </div>
              <span className="text-[9px] font-bold text-teal-600 uppercase tracking-wider">
                {getDosageLabel(drug.dosageForm)}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex justify-between items-start gap-2">
                <h3 title={drug.brandName} className="font-bold text-gray-800 group-hover:text-teal-700 transition-colors text-[15px] leading-snug truncate">
                  {drug.brandName}
                </h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  {(drug as any).brandVerified && (
                    <span className="text-teal-600" title="Verified brand">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 truncate mt-0.5">
                {drug.genericName}
              </p>
              {drug.company && (
                <p className="text-[11px] text-gray-500 truncate font-medium mt-0.5">
                  {drug.company}
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-teal-200 via-teal-100 to-transparent my-2.5" />

          {/* Bottom: Strength | Price | Drug Class */}
          <div className="flex items-start gap-3.5">
            <div className="w-14 shrink-0 flex flex-col items-center">
              {drug.strength && (
                <span className="text-[9px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded border border-teal-200 text-center leading-tight w-full truncate">
                  {drug.strength}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1 flex items-center justify-between">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium truncate">
                {drug.drugClass}
              </p>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {drug.averageRating !== undefined && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 flex items-center gap-0.5">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="#D97706" stroke="#D97706" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {drug.averageRating.toFixed(1)}
                  </span>
                )}
                {drug.price && (
                  <span className="text-sm font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                    <span className="text-teal-600">৳</span> {drug.price}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
