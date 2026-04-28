import React from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { DrugSummary } from "@/types/drug";
import { 
  TabletIcon, 
  PillIcon, 
  SyrupIcon, 
  IVDripIcon, 
  DropsIcon, 
  InhalerIcon 
} from "@/components/ui/MedicalIcons";

interface SearchSuggestionsProps {
  suggestions: DrugSummary[];
  isVisible: boolean;
  onSelect: (drug: DrugSummary) => void;
}

const getDosageIcon = (form: string) => {
  const f = form.toLowerCase();
  if (f.includes("tablet")) return <TabletIcon size={20} />;
  if (f.includes("capsule")) return <PillIcon size={20} />;
  if (f.includes("syrup") || f.includes("suspension")) return <SyrupIcon size={20} />;
  if (f.includes("drop")) return <DropsIcon size={20} />;
  if (f.includes("injection") || f.includes("infusion")) return <IVDripIcon size={20} />;
  if (f.includes("inhaler")) return <InhalerIcon size={20} />;
  return <PillIcon size={20} />;
};

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  isVisible,
  onSelect,
}) => {
  if (!isVisible || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] max-h-[400px] overflow-y-auto">
      <div className="py-2">
        {suggestions.map((drug) => (
          <button
            key={drug.id}
            onClick={() => onSelect(drug)}
            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-teal-600 hover:text-white transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-white/20 group-hover:text-white shrink-0">
              {getDosageIcon(drug.dosageForm)}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-base truncate">
                  {drug.brandName}
                </span>
                <span className="text-sm opacity-80 font-medium">
                  {drug.strength}
                </span>
              </div>
              <div className="text-xs opacity-70 truncate font-medium">
                {drug.genericName} • {drug.dosageForm}
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
