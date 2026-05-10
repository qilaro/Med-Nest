import React from "react";
import { Tag } from "lucide-react";
import { DrugSummary } from "@/types/drug";
import { getDosageIcon } from "@/components/dosage-icons";

const TYPE_COLORS: Record<string, string> = {
  Herbal: 'bg-emerald-500 text-white',
  Homeopathic: 'bg-violet-500 text-white',
  Ayurvedic: 'bg-amber-500 text-white',
  Unani: 'bg-rose-500 text-white',
  Veterinary: 'bg-blue-500 text-white',
  Supplement: 'bg-orange-500 text-white',
  Device: 'bg-gray-500 text-white',
  PersonalCare: 'bg-pink-500 text-white',
  Vaccine: 'bg-cyan-500 text-white',
};

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
  return <Icon className="w-7 h-7" />;
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
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 z-[100] max-h-[520px] overflow-y-auto">
      {isFeatured && (
        <div className="px-5 py-2.5 text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 border-b border-teal-100 text-left">
          Popular Drug Searches
        </div>
      )}
      {suggestions.map((drug) => (
        <button
          key={`${drug.type}-${drug.slug || drug.brandName}`}
          onClick={() => onSelect(drug)}
          className="w-full flex items-center gap-3 px-5 py-3 hover:bg-teal-100 transition-colors text-left cursor-pointer border-b border-gray-100 last:border-0"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100">
            {getDrugIcon(drug.type, drug.dosageForm)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-gray-800 truncate">
                {isFeatured ? drug.brandName : <HighlightText text={drug.brandName} query={query} />}
              </span>
              {drug.type === 'generic' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-yellow-400 text-yellow-900">Generic</span>
              )}
              {drug.type === 'class' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-blue-100 text-blue-700">Class</span>
              )}
              {drug.type === 'brand' && drug.strength && (
                <span className="text-sm text-teal-600 font-semibold shrink-0">{drug.strength}</span>
              )}
              {drug.type === 'brand' && drug.medicineType && drug.medicineType !== 'Allopathic' && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${TYPE_COLORS[drug.medicineType] || 'bg-gray-400 text-white'}`}>
                  {drug.medicineType}
                </span>
              )}
              {drug.type === 'brand' && (
                <span className="text-xs font-semibold text-teal-600 shrink-0 ml-auto bg-teal-50 px-2.5 py-1 rounded-full">{drug.dosageForm}</span>
              )}
            </div>
            <div className="text-sm text-gray-600 font-medium truncate mt-0.5">
              {drug.type === 'generic' && 'Learn more about this generic medicine'}
              {drug.type === 'class' && 'View drugs in this class'}
              {drug.type === 'brand' && (isFeatured ? drug.genericName + " • " + drug.company : (
                <HighlightText text={drug.genericName + " • " + drug.company} query={query} />
              ))}
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
