"use client";

import { useState, useEffect, useRef } from "react";
import { drugService } from "@/lib/services/drugService";
import { SearchSuggestions } from "@/components/drugs/SearchSuggestions";
import { DrugSummary } from "@/types/drug";
import Link from "next/link";

const FAQS = [
  {
    q: "How does the interaction checker work?",
    a: "Start by typing a drug name in the search box above and add it to your list. The checker reviews your selected medicines against each other and flags any known interactions. It considers drug-drug, drug-food, and drug-alcohol interactions based on available medical data. Always review the results with your doctor or pharmacist before making any changes to your medication.",
  },
  {
    q: "What are the different types of drug interactions?",
    a: "Drug interactions generally fall into three categories. <b>Drug-drug interactions</b> happen when two or more medicines affect each other — for example, taking a painkiller and a sleep aid together may cause excessive drowsiness. <b>Drug-food interactions</b> occur when food or drinks change how a medicine works, such as grapefruit juice affecting certain cholesterol medications. <b>Drug-condition interactions</b> happen when a medicine affects an existing health issue, like using a decongestant when you have high blood pressure.",
  },
  {
    q: "What do the interaction severity levels mean?",
    a: "Interactions are usually grouped by how serious they might be. <b>Major:</b> The combination should generally be avoided as the risks outweigh any benefit. <b>Moderate:</b> May be used under medical supervision with careful monitoring. <b>Minor:</b> Low risk but your doctor may still adjust your treatment. <b>Unknown:</b> There isn't enough data to determine the risk level.",
  },
  {
    q: "What are the warning signs of a drug interaction?",
    a: "Common warning signs include unusual drowsiness, dizziness, nausea, stomach pain, skin rash, headaches, or changes in how your medicine seems to work. Some interactions cause your heart rate to slow or speed up, while others may lead to confusion or difficulty breathing. If you notice anything unusual after starting a new medicine, contact your healthcare provider promptly.",
  },
  {
    q: "How can I prevent drug interactions?",
    a: "Keep a complete list of all your medicines — including prescription drugs, over-the-counter products, vitamins, and herbal supplements — and share it with every doctor and pharmacist you visit. Always ask your pharmacist to check for interactions whenever you start or stop a medication. Read the labels and instructions that come with your medicines, and never hesitate to ask questions if something is unclear.",
  },
  {
    q: "Can I drink alcohol while taking medication?",
    a: "Many medications can interact with alcohol, sometimes causing serious effects. Pain relievers, sleep aids, anxiety medicines, and certain antibiotics can become dangerous when mixed with alcohol — leading to increased drowsiness, liver damage, or breathing problems. Check with your pharmacist about your specific medicines, and when in doubt, avoid alcohol while on medication.",
  },
  {
    q: "Can herbal supplements cause interactions?",
    a: "Yes, herbal and dietary supplements can cause interactions just as strong as prescription drugs. St. John's Wort, ginseng, ginkgo, and even common supplements like melatonin can affect how your medicines work. Always tell your doctor and pharmacist about any supplements you take. Natural does not always mean safe when combined with other medications.",
  },
  {
    q: "Is grapefruit juice safe with my medicines?",
    a: "Grapefruit juice can interfere with many common medicines, including certain statins for cholesterol, some blood pressure drugs, and allergy medications. It can cause the medicine level in your blood to become too high, leading to increased side effects. Check your prescription label or ask your pharmacist whether grapefruit is safe with your specific medication.",
  },
  {
    q: "What should I do if I find an interaction?",
    a: "If you discover a potential interaction between your medicines, do not stop taking any medication without consulting your doctor first. Contact your healthcare provider or pharmacist to discuss the interaction. They can advise whether the combination is safe, adjust your dose, or suggest an alternative medicine. Most interactions can be managed safely with proper medical guidance.",
  },
  {
    q: "Who is at higher risk for drug interactions?",
    a: "Older adults, people taking multiple medicines (polypharmacy), and those with chronic conditions like liver or kidney disease are at greater risk for drug interactions. The more medicines you take, the higher the chance of an interaction. If you see several doctors, make sure each one knows about all the medicines you are taking to reduce your risk.",
  },
];

interface AddedDrug {
  id: string | number;
  name: string;
  slug: string;
}

export default function InteractionsPage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<DrugSummary[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching] = useState(false);
  const [drugs, setDrugs] = useState<AddedDrug[]>([]);
  const [interactions, setInteractions] = useState<Record<string, { loading: boolean; data: string | null }>>({});
  const searchRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, []);

  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    const timer = setTimeout(async () => {
      try {
        const { results } = await drugService.searchDrugs(query.trim());
        setSuggestions(results.slice(0, 10));
        setShowSuggestions(results.length > 0);
      } catch {}
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  const addDrug = (drug: DrugSummary) => {
    if (drugs.some(d => d.name.toLowerCase() === drug.brandName.toLowerCase())) return;
    const newDrug = { id: drug.id, name: drug.brandName, slug: drug.slug };
    setDrugs(prev => [...prev, newDrug]);
    setQuery("");
    setShowSuggestions(false);
    fetchInteraction(drug.slug, drug.brandName);
  };

  const removeDrug = (slug: string) => {
    setDrugs(prev => prev.filter(d => d.slug !== slug));
    setInteractions(prev => { const next = { ...prev }; delete next[slug]; return next; });
  };

  const fetchInteraction = async (slug: string, name: string) => {
    setInteractions(prev => ({ ...prev, [slug]: { loading: true, data: null } }));
    try {
      const res = await fetch(`/api/interactions?drug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      setInteractions(prev => ({ ...prev, [slug]: { loading: false, data: data.interactions || null } }));
    } catch {
      setInteractions(prev => ({ ...prev, [slug]: { loading: false, data: null } }));
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#c5e0db] via-[#d5e9e7] to-[#e5f2ef] min-h-screen">
      <div className="max-w-[1024px] mx-auto px-3 sm:px-0 py-6">
        <div className="bg-white rounded-2xl border border-sky-200 shadow-[8px_16px_40px_rgba(0,0,0,0.15),0_20px_60px_-12px_rgba(0,0,0,0.25)] p-6 sm:p-8">

          <h1 className="text-[28px] sm:text-[34px] font-bold text-gray-900 leading-tight mb-2">Drug Interaction Checker</h1>
          <p className="text-[15px] text-gray-600 mb-6">Add your medications below to check for potential interactions.</p>

          {/* Search */}
          <div className="mb-6">
            <form ref={searchRef} onSubmit={(e) => e.preventDefault()} className="relative">
              <div className="flex items-stretch rounded-full border-2 border-sky-200 bg-white focus-within:border-teal-400 focus-within:shadow-[0_0_0_4px_rgba(45,138,120,0.2)] transition-all duration-200 overflow-hidden">
                <div className="relative flex items-center flex-1 min-w-0">
                  <svg className="absolute left-5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.34-4.34M11 5a6 6 0 100 12 6 6 0 000-12z"/></svg>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                      if (window.innerWidth < 1024) {
                        setTimeout(() => {
                          const rect = searchRef.current?.getBoundingClientRect();
                          if (rect) window.scrollBy({ top: rect.top - 80, behavior: 'smooth' });
                        }, 300);
                      }
                    }}
                    placeholder="Enter a drug name"
                    className="w-full bg-transparent border-0 pl-12 pr-4 py-3.5 text-[15px] outline-none text-gray-800 placeholder:text-gray-400"
                  />
                </div>
                <button type="submit" className="shrink-0 px-6 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-[14px] transition-colors cursor-pointer flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m5 12 7 7 7-7"/></svg>
                  Add
                </button>
              </div>
              <SearchSuggestions
                suggestions={suggestions}
                isVisible={showSuggestions}
                query={query}
                isLoading={isSearching}
                onSelect={addDrug}
              />
            </form>
          </div>

          {/* Drug List + Interactions */}
          {drugs.length > 0 && (
            <div className="mb-8 space-y-4">
              {drugs.map((drug) => (
                <div key={drug.slug} className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <span className="text-[15px] font-bold text-gray-800">{drug.name}</span>
                    </div>
                    <button onClick={() => removeDrug(drug.slug)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-0 p-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
                  <div className="px-4 py-3">
                    {interactions[drug.slug]?.loading ? (
                      <div className="flex items-center gap-2 text-[13px] text-gray-400">
                        <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                        Checking interactions...
                      </div>
                    ) : interactions[drug.slug]?.data ? (
                      <div className="text-[14px] text-gray-600 leading-[1.7]">{interactions[drug.slug].data}</div>
                    ) : (
                      <p className="text-[13px] text-gray-400 italic">No specific interaction data found. Always consult your pharmacist.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Note */}
          <div className="mb-8 p-5 rounded-xl bg-amber-50 border border-amber-200 text-[14px] text-amber-800 leading-relaxed">
            <strong>⚠ Important:</strong> Not all drugs interact, and not every interaction means you must stop taking a medication. Always consult your healthcare provider about how any potential interaction should be managed.
          </div>

          {/* FAQ */}
          <div>
            <h2 id="interaction-faqs" className="text-[22px] sm:text-[24px] font-bold text-gray-900 mb-5">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="rounded-xl border border-gray-200 overflow-hidden transition-shadow duration-200 hover:shadow-md">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer bg-white hover:bg-gray-50/50 transition-colors border-0">
                    <span className="text-[15px] sm:text-[17px] font-bold text-gray-900 pr-4">{faq.q}</span>
                    <svg className={`w-5 h-5 text-teal-500 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-[15px] sm:text-[16px] text-gray-600 leading-[1.8] bg-white border-t border-gray-100" dangerouslySetInnerHTML={{ __html: faq.a }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-[13px] text-gray-400 leading-relaxed">Always consult your healthcare provider. This content is for educational purposes only.</p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-2 justify-center">
            <Link href="/drugs" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-50 border border-teal-200 text-[13px] font-bold text-teal-700 hover:bg-teal-100 transition-colors">Drug Directory</Link>
            <Link href="/indications" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-50 border border-teal-200 text-[13px] font-bold text-teal-700 hover:bg-teal-100 transition-colors">Treatment Options</Link>
            <Link href="/generics" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-50 border border-teal-200 text-[13px] font-bold text-teal-700 hover:bg-teal-100 transition-colors">Generic Ingredients</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
