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

const HighlightText = ({ text, query }: { text: string; query?: string }) => {
  const trimmedQuery = query?.trim();
  if (!trimmedQuery || trimmedQuery === "") return <>{text}</>;

  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === trimmedQuery.toLowerCase() ? (
          <span key={i} className="font-semibold text-inherit">{part}</span>
        ) : (
          <span key={i} className="text-gray-500">{part}</span>
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
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] max-h-[420px] overflow-y-auto">
      {isFeatured && (
        <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100 text-left">
          Popular Drug Searches
        </div>
      )}
      {suggestions.map((drug) => (
        <button
          key={`${drug.type}-${drug.slug}`}
          onClick={() => onSelect(drug)}
          className="w-full flex items-center gap-3 px-6 py-3.5 hover:bg-teal-600 hover:text-white transition-colors text-left cursor-pointer border-b border-gray-50 last:border-0"
        >
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-white/20 group-hover:text-white" title={drug.dosageForm}>
              {getDrugIcon(drug.type, drug.dosageForm)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-semibold truncate text-gray-900">
                {isFeatured ? drug.brandName : <HighlightText text={drug.brandName} query={query} />}
              </span>
              {drug.strength && (
                <span className="text-sm text-gray-500 shrink-0">{drug.strength}</span>
              )}
            </div>
            <div className="text-sm text-gray-400 font-medium truncate">
              {isFeatured ? drug.genericName + " • " + drug.company : (
                <HighlightText text={drug.genericName + " • " + drug.company} query={query} />
              )}
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
  );
};
