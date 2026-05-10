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
  if (type === 'class') return <Tag size={18} />;
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
        part.toLowerCase() === trimmedQuery.toLowerCase() 
          ? <span key={i} className="text-teal-600 font-semibold">{part}</span>
          : <span key={i} className="text-gray-600">{part}</span>
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
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 z-[100] max-h-[420px] overflow-y-auto">
      {isFeatured && (
        <div className="px-5 py-2.5 text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 border-b border-teal-100 text-left">
          Popular Drug Searches
        </div>
      )}
      {suggestions.map((drug) => (
        <button
          key={`${drug.type}-${drug.slug}`}
          onClick={() => onSelect(drug)}
          className="w-full flex items-center gap-3 px-5 py-3 hover:bg-teal-50 transition-colors text-left cursor-pointer border-b border-gray-100 last:border-0"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100">
            {getDrugIcon(drug.type, drug.dosageForm)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800 truncate">
                {isFeatured ? drug.brandName : <HighlightText text={drug.brandName} query={query} />}
              </span>
              {drug.strength && (
                <span className="text-xs text-teal-600 font-medium shrink-0">{drug.strength}</span>
              )}
              <span className="text-[11px] font-medium text-teal-500 shrink-0 ml-auto bg-teal-50 px-2 py-0.5 rounded-full">{drug.dosageForm}</span>
            </div>
            <div className="text-xs text-gray-500 font-medium truncate mt-0.5">
              {isFeatured ? drug.genericName + " • " + drug.company : (
                <HighlightText text={drug.genericName + " • " + drug.company} query={query} />
              )}
            </div>
          </div>
        </button>
      ))}
      {suggestions.length >= 10 && (
        <div className="px-4 py-2.5 bg-gray-50 text-xs text-center text-gray-500 font-medium border-t border-gray-100">
          Keep typing for more specific results...
        </div>
      )}
    </div>
  );
};
