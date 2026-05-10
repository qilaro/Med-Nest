import React from "react";
import { Tag } from "lucide-react";
import { DrugSummary } from "@/types/drug";
import { getDosageIcon } from "@/components/dosage-icons";

interface SearchSuggestionsProps {
  suggestions: DrugSummary[];
  isVisible: boolean;
  onSelect: (drug: DrugSummary) => void;
  isFeatured?: boolean;
  query?: string;
}

const getDrugIcon = (type: string | undefined, form?: string) => {
  if (type === 'class') return <Tag size={20} />;
  const Icon = getDosageIcon(form || '');
  return <Icon className="w-5 h-5" />;
};

const HighlightText = ({ text, query, isHighlighted }: { text: string; query?: string; isHighlighted: boolean }) => {
  const trimmedQuery = query?.trim();
  if (!trimmedQuery || trimmedQuery === "" || isHighlighted) {
    return <>{text}</>;
  }

  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
  
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === trimmedQuery.toLowerCase() ? (
          <span key={i} className="font-bold text-navy group-hover:text-white">
            {part}
          </span>
        ) : (
          <span key={i} className="font-medium text-gray-400 group-hover:text-white/60">
            {part}
          </span>
        )
      )}
    </>
  );
};

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  isVisible,
  onSelect,
  isFeatured = false,
  query = "",
}) => {
  if (!isVisible || (suggestions.length === 0 && query.trim() !== "")) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] max-h-[400px] overflow-y-auto">
      {isFeatured && (
        <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100 text-left">
          Popular Drug Searches
        </div>
      )}
      <div className="py-2">
        {suggestions.map((drug) => (
          <button
            key={`${drug.type}-${drug.slug}`}
            onClick={() => onSelect(drug)}
            className="w-full flex items-start gap-4 px-6 py-4 hover:bg-teal-600 hover:text-white transition-colors text-left group cursor-pointer"
          >
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-white/20 group-hover:text-white">
                {getDrugIcon(drug.type, drug.dosageForm)}
              </div>
              <span title={drug.dosageForm} className="text-[10px] leading-tight text-gray-400 group-hover:text-white/70 text-center max-w-[48px] truncate">
                {drug.dosageForm}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-baseline gap-2">
                <span className="text-lg truncate font-semibold">
                  <HighlightText text={drug.brandName} query={query} isHighlighted={isFeatured} />
                </span>
                {drug.strength && (
                  <span className="text-base opacity-80 font-medium">
                    {drug.strength}
                  </span>
                )}
              </div>
              <div className="text-sm opacity-70 truncate font-medium">
                <HighlightText text={drug.genericName} query={query} isHighlighted={isFeatured} />
                {" • "}
                {drug.company}
              </div>
            </div>
          </button>
        ))}
        {suggestions.length >= 10 && (
          <div className="px-4 py-2 bg-gray-50 text-xs text-center text-gray-500 font-medium border-t border-gray-100">
            Keep typing for more specific results...
          </div>
        )}
      </div>
    </div>
  );
};
