"use client";

import { useState } from "react";
import Link from "next/link";
import { getDosageIcon } from "@/components/dosage-icons";

interface Brand {
  id: string; brand_name: string; slug: string; strength: string; dosage_form: string;
  company_name: string; generic_name: string; generic_slug: string;
}

export default function BrandTable({ brands }: { brands: Brand[] }) {
  const [page, setPage] = useState(0);
  const perPage = 10;
  const totalPages = Math.ceil(brands.length / perPage);
  const pageBrands = brands.slice(page * perPage, (page + 1) * perPage);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pageBrands.map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
        {pageBrands.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-[14px]">No brands found.</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-5">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
            className="px-3.5 py-2 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">← Prev</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={`w-9 h-9 rounded-lg border text-[13px] font-bold cursor-pointer transition-colors ${i === page ? "bg-teal-600 text-white border-teal-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{i + 1}</button>
          ))}
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1}
            className="px-3.5 py-2 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">Next →</button>
        </div>
      )}
    </div>
  );
}

function BrandCard({ brand }: { brand: Brand }) {
  const drugSlug = brand.slug || brand.brand_name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "#";
  const genSlug = brand.generic_slug || brand.generic_name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "";

  const DosageIcon = getDosageIcon(brand.dosage_form || "");

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-teal-400 to-teal-500" />
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
            <DosageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-700" />
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/drugs/${drugSlug}`} className="text-[16px] sm:text-[17px] font-bold text-gray-900 hover:text-teal-700 transition-colors block leading-tight truncate">
              {brand.brand_name}
            </Link>
            {brand.company_name && (
              <p className="text-[12px] text-gray-400 mt-0.5 truncate">{brand.company_name}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {brand.generic_name && (
                <Link href={`/generics/${genSlug}`} className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-[12px] text-gray-600 hover:text-teal-700 hover:bg-teal-50 hover:border-teal-200 transition-colors">
                  {brand.generic_name}
                </Link>
              )}
              {brand.strength && brand.strength !== "N/A" && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 text-[12px] text-blue-700 font-medium">
                  {brand.strength}
                </span>
              )}
              {brand.dosage_form && brand.dosage_form !== "N/A" && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-50 border border-purple-100 text-[12px] text-purple-700 font-medium">
                  {brand.dosage_form}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
