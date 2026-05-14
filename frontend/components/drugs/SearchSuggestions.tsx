import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { Tag, Clock, FlaskConical } from "lucide-react";
import { DrugSummary } from "@/types/drug";
import { getDosageIcon } from "@/components/dosage-icons";

interface SearchSuggestionsProps {
  suggestions: DrugSummary[];
  isVisible: boolean;
  onSelect: (drug: DrugSummary) => void;
  isFeatured?: boolean;
  query?: string;
  isLoading?: boolean;
  total?: number;
  onViewAll?: () => void;
}

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

const getDrugIcon = (type: string | undefined, form?: string) => {
  if (type === 'class') return <Tag size={18} />;
  if (type === 'generic') return <FlaskConical size={18} className="text-teal-500" />;
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
          ? <span key={i} className="text-teal-700 font-bold">{part}</span>
          : <span key={i} className="text-gray-700">{part}</span>
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
  isLoading = false,
  total,
  onViewAll,
}) => {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const highlightedRef = useRef(-1);
  const keyboardNavRef = useRef(false);
  highlightedRef.current = highlightedIndex;

  // Reset highlight when query changes
  useLayoutEffect(() => {
    highlightedRef.current = -1;
    keyboardNavRef.current = false;
    setHighlightedIndex(-1);
  }, [query]);

  // Reset highlight when dropdown closes
  useEffect(() => {
    if (!isVisible) { keyboardNavRef.current = false; }
  }, [isVisible]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-index]');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  // Expose keyboard handler for parent to call
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isVisible) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        keyboardNavRef.current = true;
        setHighlightedIndex(prev => {
          const next = Math.min(prev + 1, suggestions.length - 1);
          highlightedRef.current = next;
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        keyboardNavRef.current = true;
        setHighlightedIndex(prev => {
          const next = Math.max(prev - 1, 0);
          highlightedRef.current = next;
          return next;
        });
      } else if (e.key === 'Enter') {
        const idx = highlightedRef.current;
        if (keyboardNavRef.current && idx >= 0 && suggestions[idx]) {
          e.preventDefault();
          onSelect(suggestions[idx]);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    }, [isVisible, suggestions, onSelect]);

  if (!isVisible && !isLoading) return null;

  const isEmpty = suggestions.length === 0 && !isLoading;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-200 z-[9999] max-h-[50vh] overflow-y-auto" ref={listRef} onMouseLeave={() => setHighlightedIndex(-1)}>
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center gap-3 px-5 py-6 text-gray-400 text-sm">
          <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          Searching...
        </div>
      )}

      {/* No results state */}
      {isEmpty && query.trim() && (
        <div className="px-5 py-8 text-center text-gray-400">
          <div className="text-3xl mb-2">🔍</div>
          <p className="font-medium text-gray-500">No results for "{query.trim()}"</p>
          <p className="text-xs mt-1">Try a different spelling or a broader term</p>
        </div>
      )}

      {/* Recent search label */}
      {isFeatured && suggestions.length > 0 && !query.trim() && (
        <div className="px-3 sm:px-5 py-1.5 sm:py-2.5 text-[9px] sm:text-xs font-bold text-teal-700 uppercase tracking-wider bg-teal-50 border-b border-teal-100 text-left flex items-center gap-1 sm:gap-2">
          <Clock size={10} className="sm:size-[14px]" />
          Popular Drug Searches
        </div>
      )}

      {/* Suggestions */}
      {suggestions.map((drug, index) => (
        <button
          type="button"
          key={`${drug.type}-${drug.slug || drug.brandName}-${index}`}
          data-index={index}
          onClick={() => onSelect(drug)}
          onMouseEnter={() => setHighlightedIndex(index)}
          className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 transition-colors text-left cursor-pointer border-b border-gray-100 last:border-0 ${
            highlightedIndex === index ? 'bg-teal-200 shadow-sm' : 'hover:bg-teal-100'
          }`}
        >
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100">
            {(drug as any)._recent ? <Clock size={20} className="text-teal-500" /> : getDrugIcon(drug.type, drug.dosageForm)}
          </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                <span className="text-sm sm:text-base font-semibold text-gray-800 truncate min-w-0 max-w-[55%] sm:max-w-none">
                  {isFeatured ? drug.brandName : <HighlightText text={drug.brandName} query={query} />}
                </span>
                {drug.type === 'generic' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-yellow-400 text-yellow-900">Generic</span>
                )}
                {drug.type === 'class' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-blue-100 text-blue-700">Class</span>
                )}
                {drug.type === 'brand' && drug.strength && (
                  <span className="text-xs sm:text-sm text-teal-600 font-semibold shrink-0 whitespace-nowrap">{drug.strength}</span>
                )}
                {drug.type === 'brand' && drug.medicineType && drug.medicineType !== 'Allopathic' && (
                  <span className={`inline-flex text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TYPE_COLORS[drug.medicineType] || 'bg-gray-400 text-white'}`}>
                    {drug.medicineType}
                  </span>
                )}
                {drug.type === 'brand' && (
                  <span className="inline-flex text-[9px] sm:text-xs font-semibold text-teal-600 bg-teal-50 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full truncate max-w-[80px] sm:max-w-none">{drug.dosageForm}</span>
                )}
              </div>
            <div className="text-sm text-gray-600 font-medium truncate mt-0.5">
              {(drug as any)._recent && 'Recent search'}
              {drug.type === 'generic' && !(drug as any)._recent && 'Learn more about this generic medicine'}
              {drug.type === 'class' && 'View drugs in this class'}
              {drug.type === 'brand' && !(drug as any)._recent && (isFeatured ? drug.genericName + " • " + drug.company : (
                <HighlightText text={drug.genericName + " • " + drug.company} query={query} />
              ))}
            </div>
          </div>
        </button>
      ))}

      {total !== undefined && total > suggestions.length && (
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
          <Link href={`/drugs?search=${encodeURIComponent(query || '')}`} onClick={onViewAll} className="block text-center text-xs font-semibold text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg py-2 transition-colors">
            View All {total} Results →
          </Link>
        </div>
      )}
    </div>
  );
};
