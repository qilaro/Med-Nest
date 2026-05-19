import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import CollapsibleSection from "@/components/drugs/CollapsibleSection";

interface PageProps {
  params: Promise<{ genericSlug: string }>;
}

async function getGeneric(slug: string) {
  const name = decodeURIComponent(slug)
    .replace(/[+]/g, " ").replace(/-/g, " ").replace(/\s+/g, " ").trim();

  const result = await db.execute(sql`
    SELECT g.id, g.name, g.pronunciation, g.therapeutic_class, g.indications, g.side_effects,
           g.warnings, g.precautions, g.contraindications, g.pregnancy_lactation,
           g.dosage, g.interactions, g.pregnancy_category, g.csa_schedule, g.half_life,
           g.storage_conditions, g.overdose_effects, g.special_populations, g.what_is,
           (SELECT COUNT(*) FROM brands WHERE generic_id = g.id)::int as brand_count
    FROM generics g
    WHERE g.name ILIKE ${"%" + name.toLowerCase().split(/\s+/).join("%") + "%"}
    LIMIT 1
  `);
  return result.rows[0] as any || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { genericSlug } = await params;
  const g = await getGeneric(genericSlug);
  if (!g) return { title: "Generic Not Found" };
  return {
    title: `${g.name} - Generic Medicine Information | Med-Nest Bangladesh`,
    description: `${g.name}${g.therapeutic_class ? ` (${g.therapeutic_class})` : ""}. Uses, side effects, dosage, warnings, and interactions.`,
    robots: { index: true, follow: true },
  };
}

export default async function GenericDetailPage({ params }: PageProps) {
  const { genericSlug } = await params;
  const generic = await getGeneric(genericSlug);
  if (!generic) notFound();

  const name = generic.name;
  const sections: { id: string; label: string; content: string | null }[] = [
    { id: "uses", label: "Uses", content: generic.indications },
    { id: "before-taking", label: "Before Taking", content: "always" },
    { id: "side-effects", label: "Side Effects", content: generic.side_effects },
    { id: "warnings", label: "Warnings", content: generic.warnings },
    { id: "dosage", label: "Dosage", content: generic.dosage },
    { id: "interactions", label: "Interactions", content: generic.interactions },
  ].filter(s => s.content);

  return (
    <div className="bg-gradient-to-b from-[#c5e0db] via-[#d5e9e7] to-[#e5f2ef] min-h-screen">
      <div className="max-w-[1024px] mx-auto px-3 sm:px-0 py-6">

        <div className="flex items-center gap-2 text-[14px] text-gray-500 mb-4 px-1">
          <Link href="/" className="hover:text-teal-600">Home</Link>
          <span>/</span>
          <Link href="/generics" className="hover:text-teal-600">Generics</Link>
          <span>/</span>
          <span className="text-gray-800 font-semibold truncate">{name}</span>
        </div>

        <div className="bg-white rounded-2xl border border-sky-200 shadow-[8px_16px_40px_rgba(0,0,0,0.15),0_20px_60px_-12px_rgba(0,0,0,0.25)] p-7 sm:p-9 overflow-visible">

          {/* Hero */}
          <div className="flex items-start gap-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-[26px] sm:text-[32px] font-bold text-gray-900 leading-tight capitalize">{name}</h1>
                {generic.pronunciation && (
                  <span className="text-[14px] text-gray-400 italic">({generic.pronunciation})</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                {generic.therapeutic_class && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[12px] font-bold text-teal-700">
                    {generic.therapeutic_class}
                  </span>
                )}
                {generic.brand_count > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[12px] font-bold text-blue-700">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    {generic.brand_count} brand{generic.brand_count !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <Link href={`/drugs?generic=${encodeURIComponent(name)}`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white text-[12px] sm:text-[13px] font-bold shadow-md hover:shadow-lg hover:from-teal-600 hover:to-teal-700 transition-all active:scale-[0.97]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span>View all brands</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </Link>
              </div>
            </div>
            <div className="shrink-0 self-start">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[12px] font-bold text-emerald-700 shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/><path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                DGDA Verified
              </span>
            </div>
          </div>

          <hr className="my-4 border-gray-100" />

          {/* In-page nav */}
          {sections.length > 0 && (
            <div className="-mx-7 sm:-mx-9 px-7 sm:px-9 py-2 border-b border-gray-100/50">
              <div className="flex gap-1.5 flex-wrap">
                {sections.map(s => (
                  <a key={s.id} href={`#section-${s.id}`}
                    className="shrink-0 px-3.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[11px] sm:text-[14px] font-bold border-2 border-teal-300 text-teal-700 hover:bg-teal-100 hover:border-teal-500 transition-colors shadow-sm hover:shadow-md">
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Medical content */}
          <div className="max-w-none space-y-6 mt-3">

            {/* Uses */}
            {generic.indications && generic.indications !== "Information not available." && (
              <section id="section-uses" className="scroll-mt-24 target:bg-teal-50/60 target:rounded-lg transition-all duration-300">
                <CollapsibleSection title={`What is ${name} used for?`}>
                  <p>{generic.indications}</p>
                  {generic.what_is && generic.what_is !== "Information not available." && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h3 className="text-[16px] font-bold text-gray-900 mb-1">What is {name}?</h3>
                      <p>{generic.what_is}</p>
                    </div>
                  )}
                </CollapsibleSection>
              </section>
            )}

            {/* Side Effects */}
            {generic.side_effects && generic.side_effects !== "Information not available." && (
              <section id="section-side-effects" className="scroll-mt-24 target:bg-teal-50/60 target:rounded-lg transition-all duration-300">
                <CollapsibleSection title="Side Effects">
                  <p>{generic.side_effects}</p>
                  {generic.overdose_effects && generic.overdose_effects !== "Information not available." && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h3 className="text-[16px] font-bold text-gray-900 mb-2">Overdose Effects</h3>
                      <p>{generic.overdose_effects}</p>
                    </div>
                  )}
                </CollapsibleSection>
              </section>
            )}

            {/* Warnings */}
            {generic.warnings && generic.warnings !== "Information not available." && (
              <section id="section-warnings" className="scroll-mt-24 target:bg-teal-50/60 target:rounded-lg transition-all duration-300">
                <CollapsibleSection title="Warnings & Precautions" icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                }>
                  <p>{generic.warnings}</p>
                  {generic.precautions && generic.precautions !== "Information not available." && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h3 className="text-[16px] font-bold text-gray-900 mb-2">Precautions</h3>
                      <p>{generic.precautions}</p>
                    </div>
                  )}
                </CollapsibleSection>
              </section>
            )}

            {/* Dosage */}
            {generic.dosage && generic.dosage !== "Information not available." && (
              <section id="section-dosage" className="scroll-mt-24 target:bg-teal-50/60 target:rounded-lg transition-all duration-300">
                <CollapsibleSection title="Dosage & Administration">
                  <p>{generic.dosage}</p>
                  {generic.storage_conditions && generic.storage_conditions !== "Information not available." && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h3 className="text-[16px] font-bold text-gray-900 mb-2">Storage Conditions</h3>
                      <p>{generic.storage_conditions}</p>
                    </div>
                  )}
                </CollapsibleSection>
              </section>
            )}

            {/* Before Taking */}
            {(generic.contraindications || generic.precautions || generic.pregnancy_lactation) && (
              <section id="section-before-taking" className="scroll-mt-24 target:bg-teal-50/60 target:rounded-lg transition-all duration-300">
                <CollapsibleSection title="Before Taking">
                  {(generic.pregnancy_category || generic.csa_schedule || generic.half_life) && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                      {generic.pregnancy_category && generic.pregnancy_category !== "Information not available." && (
                        <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Pregnancy</div>
                          <div className="text-[16px] font-bold text-gray-900">Category {generic.pregnancy_category}</div>
                        </div>
                      )}
                      {generic.csa_schedule && generic.csa_schedule !== "Information not available." && (
                        <div className="rounded-lg bg-purple-50 border border-purple-100 p-3">
                          <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider mb-0.5">CSA Schedule</div>
                          <div className="text-[16px] font-bold text-gray-900">{generic.csa_schedule}</div>
                        </div>
                      )}
                      {generic.half_life && generic.half_life !== "Information not available." && (
                        <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                          <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">Half-Life</div>
                          <div className="text-[16px] font-bold text-gray-900">{generic.half_life}</div>
                        </div>
                      )}
                    </div>
                  )}
                  {generic.contraindications && generic.contraindications !== "Information not available." && (
                    <div className="mb-4">
                      <h3 className="text-[16px] font-bold text-gray-900 mb-2">Contraindications</h3>
                      <p className="text-[14px] lg:text-[15px] text-gray-700 leading-[1.55]">{generic.contraindications}</p>
                    </div>
                  )}
                  {generic.pregnancy_lactation && generic.pregnancy_lactation !== "Information not available." && (
                    <div>
                      <h3 className="text-[16px] font-bold text-gray-900 mb-2">Pregnancy & Lactation</h3>
                      <p className="text-[14px] lg:text-[15px] text-gray-700 leading-[1.55]">{generic.pregnancy_lactation}</p>
                    </div>
                  )}
                </CollapsibleSection>
              </section>
            )}

            {/* Interactions */}
            {generic.interactions && generic.interactions !== "Information not available." && (
              <section id="section-interactions" className="scroll-mt-24 target:bg-teal-50/60 target:rounded-lg transition-all duration-300">
                <CollapsibleSection title="Drug Interactions">
                  <p>{generic.interactions}</p>
                </CollapsibleSection>
              </section>
            )}

            {/* Disclaimer */}
            <p className="text-[14px] text-gray-400 leading-relaxed text-center pt-2">
              This information is for educational purposes only. Always consult your physician or pharmacist.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
