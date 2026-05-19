import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import BrandTable from "@/components/BrandTable";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const DESCRIPTIONS: Record<string, string> = {
  fever: "Fever, headache, toothache, and body aches are the most common health complaints in Bangladesh. Below are the most commonly prescribed brand-name medications available in local pharmacies.",
  "bacterial-infection": "Bacterial, viral, and fungal infections are among the most common reasons for visiting a doctor in Bangladesh. These brands are widely prescribed by physicians across the country.",
  gerd: "GERD, acid reflux, and peptic ulcers are widespread digestive health problems in Bangladesh. These medications are among the most commonly sold in pharmacies nationwide.",
  "diabetes-type-2": "Diabetes affects millions of people in Bangladesh. These are the most commonly prescribed diabetes medications available in the country.",
  "high-blood-pressure": "Hypertension affects a large portion of Bangladesh's adult population. These blood pressure medications are widely prescribed by doctors.",
  "high-cholesterol": "High cholesterol is a growing health concern in Bangladesh linked to diet and lifestyle. These cholesterol-lowering brands are commonly prescribed.",
  asthma: "Respiratory conditions like asthma are increasingly common due to air pollution in Bangladesh. These inhalers and medications are widely available in pharmacies.",
  allergies: "Allergies and allergic disorders affect a significant number of people in Bangladesh. These antihistamines and allergy medications are commonly used.",
  cancer: "Cancer rates are rising in Bangladesh. These oncology medications are available through specialized treatment centers across the country.",
};

function getDesc(slug: string) {
  return DESCRIPTIONS[slug] || "Find medications for this condition available in Bangladesh. Below are commonly prescribed brand-name medications.";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const c = (await db.execute(sql`SELECT name FROM conditions WHERE slug = ${slug} LIMIT 1`)).rows[0] as any;
  const name = c?.name || slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  return { title: `Medications for ${name} in Bangladesh | Med-Nest`, description: getDesc(slug) };
}

export default async function ConditionDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const condition = (await db.execute(sql`SELECT name FROM conditions WHERE slug = ${slug} LIMIT 1`)).rows[0] as any;
  if (!condition) notFound();
  const name = condition.name;

  const brands = (await db.execute(sql`
    SELECT DISTINCT ON (b.brand_name) b.id, b.brand_name, b.slug, b.strength, b.dosage_form, b.company_name, b.average_rating,
      (SELECT g2.name FROM generics g2 WHERE g2.id = b.generic_id LIMIT 1) as generic_name,
      (SELECT g2.slug FROM generics g2 WHERE g2.id = b.generic_id LIMIT 1) as generic_slug
    FROM brands b
    JOIN condition_generics cg ON cg.generic_id = b.generic_id
    WHERE cg.condition_id = (SELECT id FROM conditions WHERE slug = ${slug} LIMIT 1)
      AND b.brand_name IS NOT NULL
    ORDER BY b.brand_name, b.average_rating DESC NULLS LAST
    LIMIT 20
  `)).rows as any[];

  return (
    <div className="bg-gradient-to-b from-[#c5e0db] via-[#d5e9e7] to-[#e5f2ef] min-h-screen">
      <div className="max-w-[1024px] mx-auto px-3 sm:px-0 py-6">
        <div className="bg-white rounded-2xl border border-sky-200 shadow-[8px_16px_40px_rgba(0,0,0,0.15),0_20px_60px_-12px_rgba(0,0,0,0.25)] p-5 sm:p-8">

          <nav className="text-[13px] text-gray-500 mb-4" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link href="/" className="hover:text-teal-600">Home</Link></li>
              <li className="text-gray-300">/</li>
              <li><Link href="/indications" className="hover:text-teal-600">Treatments</Link></li>
              <li className="text-gray-300">/</li>
              <li className="text-gray-800 font-medium">{name}</li>
            </ol>
          </nav>

            <h1 className="text-[24px] sm:text-[26px] lg:text-[28px] font-bold text-gray-900 leading-tight mb-2">Medications for {name} in Bangladesh</h1>
          <p className="text-[15px] text-gray-600 leading-[1.7] mb-5">{getDesc(slug)}</p>

          <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-[13px] text-amber-800 leading-relaxed">
            <strong>⚠ Important:</strong> These medications are commonly prescribed by doctors for {name} in Bangladesh. Always consult a healthcare professional before taking any medicine.
          </div>

          <div className="mb-5">
            <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900 mb-1">Brands used to treat {name}</h2>
            <p className="text-[13px] text-gray-500 mb-4">Most common {brands.length} brand{brands.length !== 1 ? "s" : ""}</p>
            <BrandTable brands={brands} />
          </div>

          <div className="pt-5 border-t border-gray-100">
            <h3 className="text-[14px] font-bold text-gray-600 mb-3">Browse treatment options</h3>
            <div className="flex flex-wrap gap-1.5">
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l => (
                <Link key={l} href={`/indications#letter-${l}`} className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[13px] font-bold text-teal-700 hover:bg-teal-100 transition-colors">{l}</Link>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-[12px] text-gray-400 leading-relaxed">Always consult your healthcare provider. This content is for educational purposes only.</p>
          </div>

          <div className="mt-5 text-center">
            <Link href="/indications" className="inline-flex items-center gap-1 text-[14px] font-semibold text-teal-600 hover:underline">← Back to all conditions</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
