import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import ConditionSearch from "@/components/indications/ConditionSearch";
import ExpandableFeaturedCard from "@/components/indications/ExpandableFeaturedCard";

export const metadata: Metadata = {
  title: "Treatment Options for Diseases & Conditions | Med-Nest Bangladesh",
  description: "Find your disease or condition and discover what medication options are available for you in Bangladesh. Browse medications by condition.",
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const FEATURED = [
  {
    name: "Fever & Pain",
    slug: "fever",
    desc: "Fever, headache, toothache, and body aches are the most common health complaints in Bangladesh. Learn about paracetamol, ibuprofen, and other analgesic and antipyretic medications available for managing fever and pain at home.",
  },
  {
    name: "Infections",
    slug: "bacterial-infection",
    desc: "Bacterial, viral, and fungal infections are among the most common reasons for visiting a doctor in Bangladesh. This guide covers antibiotics, antivirals, antifungals, and their proper use to fight common infectious diseases.",
  },
  {
    name: "Gastrointestinal Disorders",
    slug: "gerd",
    desc: "GERD, acid reflux, peptic ulcers, and Crohn's disease are widespread digestive health problems in Bangladesh. Information on proton pump inhibitors, H2 antagonists, antacids, and other medications used to treat these gastrointestinal conditions.",
  },
  {
    name: "Diabetes",
    slug: "diabetes-type-2",
    desc: "Diabetes is a chronic metabolic disease characterized by high blood glucose levels. With millions affected in Bangladesh, learn about the different types of diabetes, how insulin and other medications like metformin and sulfonylureas help manage blood sugar, and how to prevent complications.",
  },
  {
    name: "High Blood Pressure",
    slug: "high-blood-pressure",
    desc: "Hypertension affects a large portion of Bangladesh's adult population and is a major risk factor for heart disease and stroke. Learn about ACE inhibitors, beta-blockers, calcium channel blockers, and diuretics commonly prescribed for blood pressure control.",
  },
  {
    name: "Heart Disease",
    slug: "heart-disease",
    desc: "Heart disease remains a leading cause of death in Bangladesh. This center covers coronary artery disease, angina, and heart failure — along with the medications used in treatment including nitrates, statins, beta-blockers, ACE inhibitors, and anti-platelet drugs.",
  },
  {
    name: "High Cholesterol",
    slug: "high-cholesterol",
    desc: "High cholesterol is a growing health concern in Bangladesh linked to diet and lifestyle. This center explains the difference between LDL (bad) and HDL (good) cholesterol, how diet and exercise help, and the statins and other lipid-lowering drugs available for treatment.",
  },
  {
    name: "Asthma & COPD",
    slug: "asthma",
    desc: "Respiratory conditions like asthma and COPD are increasingly common in Bangladesh due to air pollution and smoking. This center covers inhalers, bronchodilators, corticosteroids, and combination therapies for managing these chronic lung diseases.",
  },
  {
    name: "Allergies & Hay Fever",
    slug: "allergies",
    desc: "Allergies and allergic disorders affect a significant number of people in Bangladesh. This center covers the most common allergies, their triggers, and the drug treatments available including antihistamines, decongestants, nasal sprays, mast cell stabilizers, and anti-inflammatory drugs.",
  },
  {
    name: "Cancer",
    slug: "cancer",
    desc: "Cancer is a group of diseases characterized by abnormal cells growing out of control. With rising rates in Bangladesh, this center covers the various types of cancer, causes, diagnosis methods, and the chemotherapy agents, targeted therapies, and other oncology drugs available for treatment.",
  },
  {
    name: "AIDS/HIV",
    slug: "aids-hiv",
    desc: "HIV/AIDS has become a global epidemic affecting millions worldwide. This center provides essential information on HIV and AIDS — the difference between them, signs and symptoms, prevention methods, complications, and the common antiretroviral drug treatments available in Bangladesh.",
  },
  {
    name: "Bipolar Disorder",
    slug: "bipolar-disorder",
    desc: "Bipolar disorder is a lifelong mood disorder that affects how you feel and act, caused by chemical imbalances in the brain. Learn about the manic highs and depressive lows, and the mood stabilizers, antipsychotics, and other medications available in Bangladesh for managing this condition.",
  },
  {
    name: "Hair Loss",
    slug: "hair-loss",
    desc: "Hair loss can result from genetics, stress, hormonal changes, or medical conditions. This center covers the treatments available in Bangladesh for reducing hair loss and promoting regrowth, including topical and oral medications.",
  },
  {
    name: "Menopause",
    slug: "menopause",
    desc: "Menopause is a natural transition in a woman's life when ovulation stops and hormone levels change. This center describes the causes, symptoms, and treatment options available in Bangladesh including hormone replacement therapy and symptom management medications.",
  },
];

export default async function IndicationsPage() {
  const conditions = await db.execute(sql`
    SELECT c.name, c.slug, COUNT(cg.generic_id)::int as drug_count
    FROM conditions c
    LEFT JOIN condition_generics cg ON c.id = cg.condition_id
    GROUP BY c.id, c.name, c.slug
    ORDER BY c.name ASC
  `);

  const rows = conditions.rows as { name: string; slug: string; drug_count: number }[];

  const grouped: Record<string, typeof rows> = {};
  for (const c of rows) {
    const first = c.name[0].toUpperCase();
    if (!grouped[first]) grouped[first] = [];
    grouped[first].push(c);
  }

  return (
    <div className="bg-gradient-to-b from-[#c5e0db] via-[#d5e9e7] to-[#e5f2ef] min-h-screen">
      <div className="max-w-[1024px] mx-auto px-3 sm:px-0 py-5 sm:py-6">
        <div className="bg-white rounded-2xl border border-sky-200 shadow-[8px_16px_40px_rgba(0,0,0,0.15),0_20px_60px_-12px_rgba(0,0,0,0.25)] p-5 sm:p-9 overflow-visible">

          <div className="mb-6">
            <h1 className="text-[22px] sm:text-[28px] font-bold text-gray-900 leading-tight">Treatment Options</h1>
            <p className="text-[14px] sm:text-[15px] text-gray-600 mt-1.5 max-w-[320px] sm:max-w-2xl">Find your disease or condition and discover what medication options are available for you in Bangladesh.</p>
          </div>

          <ConditionSearch />

          <div className="mb-6 pb-5 border-b border-gray-100">
            <h2 className="text-[13px] sm:text-[15px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">Browse A-Z</h2>
            <div className="grid grid-cols-9 sm:flex sm:flex-wrap gap-0.5 sm:gap-1.5">
              {LETTERS.map(l => (
                <a key={l} href={`#letter-${l}`} className="w-full sm:w-10 sm:h-10 aspect-square rounded sm:rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[10px] sm:text-[14px] font-bold text-teal-700 hover:bg-teal-100 hover:border-teal-400 transition-colors" aria-label={`Browse conditions by letter: ${l}`}>
                  {l}
                </a>
              ))}
            </div>
          </div>

          <div className="mb-6 pb-5 border-b border-gray-100">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900 mb-3">Find Common Treatments</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
              {rows.filter(c => c.drug_count > 3).map(c => (
                <Link key={c.slug} href={`/indications/${c.slug}`} className="px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl bg-white border border-gray-200 text-[14px] sm:text-[16px] font-semibold text-teal-700 hover:bg-teal-50 hover:border-teal-300 hover:shadow-sm transition-all">
                  <span className="block leading-tight">{c.name}</span>
                  <span className="text-gray-400 text-[12px] sm:text-[13px] font-normal mt-1 block">{c.drug_count} drug{c.drug_count !== 1 ? "s" : ""}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-6 pb-5 border-b border-gray-100">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900 mb-1">Featured Treatment Centers</h2>
            <p className="text-[13px] sm:text-[14px] text-gray-500 mb-4">Comprehensive guides on common health conditions and their treatment options in Bangladesh</p>
            <div className="space-y-3 sm:space-y-4">
              {FEATURED.map(f => (
                <ExpandableFeaturedCard key={f.slug} name={f.name} slug={f.slug} desc={f.desc} />
              ))}
            </div>
          </div>

          <div className="mb-6 pb-5 border-b border-gray-100">
            <p className="text-[13px] sm:text-[14px] text-gray-600 leading-relaxed">
              <span className="font-medium text-gray-500">See also:</span>{" "}
              <Link href="/drugs" className="text-teal-700 hover:underline font-medium">Drugs by Classification</Link>
              <span className="text-gray-300 mx-1">|</span>
              <Link href="/generics" className="text-teal-700 hover:underline font-medium">Generic Ingredients</Link>
              <span className="text-gray-300 mx-1">|</span>
              <Link href="/companies" className="text-teal-700 hover:underline font-medium">Pharmaceutical Companies</Link>
            </p>
          </div>

          <div>
            <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900 mb-3">All Conditions</h2>
            {LETTERS.filter(l => grouped[l]).map(letter => (
              <div key={letter} id={`letter-${letter}`} className="mb-4 scroll-mt-20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-teal-500 text-white flex items-center justify-center text-[12px] sm:text-[13px] font-bold shrink-0">{letter}</span>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
                  {grouped[letter].map(c => (
                    <Link key={c.slug} href={`/indications/${c.slug}`} className="px-3 py-2 sm:px-3 sm:py-2 rounded-lg text-[13px] sm:text-[14px] text-gray-700 hover:text-teal-700 hover:bg-teal-50 transition-colors">
                      {c.name}
                      <span className="text-gray-400 text-[11px] sm:text-[12px] ml-1 font-normal">({c.drug_count})</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link href="/indications" className="inline-flex items-center gap-1 text-[14px] font-semibold text-teal-600 hover:underline">← Back to all conditions</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
