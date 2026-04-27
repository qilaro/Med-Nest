"use client";

import Link from "next/link";
import { Pill } from "lucide-react";
import { DrugSummary } from "../../types/drug";
import { Card, CardContent } from "../ui/card";
import StarRating from "../ui/StarRating";

interface DrugCardProps {
  drug: DrugSummary;
}

/**
 * DrugCard component for displaying medication summaries in a grid.
 * Uses shadcn/ui Card for the frame and themed Tailwind classes.
 */
export default function DrugCard({ drug }: DrugCardProps) {
  return (
    <Link href={`/drugs/${drug.slug}`} className="block group">
      <Card className="transition-all duration-200 hover:border-primary hover:shadow-md overflow-hidden">
        <CardContent className="p-4 flex items-start gap-4">
          {/* Icon Container with Branding Colors */}
          <div 
            className="w-12 h-12 rounded-xl bg-mint-soft flex items-center justify-center shrink-0 transition-colors group-hover:bg-primary/10"
            aria-hidden="true"
          >
            <Pill className="h-6 w-6 text-primary" />
          </div>

          {/* Medication Info */}
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-navy group-hover:text-primary transition-colors truncate text-lg leading-tight">
              {drug.brandName}
            </h3>
            <p className="text-sm text-muted-foreground truncate italic">
              {drug.genericName}
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wider">
              {drug.drugClass}
            </p>

            {/* Rating Section */}
            {drug.averageRating !== undefined && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={drug.averageRating} size="sm" />
                <span className="text-xs text-muted-foreground">
                  ({drug.reviewCount ?? 0})
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
