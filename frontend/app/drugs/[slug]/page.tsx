import { notFound } from "next/navigation";
import { getDrugDetail, getAlternateBrands } from "@/lib/services/detailService";
import { Metadata } from "next";
import { getDosageIcon } from "@/components/dosage-icons";
import Link from "next/link";
import { slugify } from "@/lib/utils/slugify";
import CollapsibleSection from "@/components/drugs/CollapsibleSection";
import PrintButton from "@/components/drugs/PrintButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const drug = await getDrugDetail(slug);
  if (!drug) return { title: "Medicine Not Found" };
  const unitPrice = parseFloat(String(drug.price).replace(/[^0-9.]/g, "")) || 0;
  return {
    title: `${drug.brandName} ${drug.strength} - ৳${unitPrice.toFixed(2)} Price in Bangladesh | Med-Nest`,
    description: `${drug.brandName} ${drug.strength} (${drug.genericName}) - ৳${unitPrice.toFixed(2)} per unit. ${drug.dosageForm} by ${drug.company}. ${drug.drugClass ? `Drug Class: ${drug.drugClass}. ` : ""}Uses, side effects, dosage & interactions.`,
    openGraph: {
      title: `${drug.brandName} ${drug.strength} - ৳${unitPrice.toFixed(2)} Price in Bangladesh`,
      description: `${drug.brandName} (${drug.genericName}) - ${drug.strength} ${drug.dosageForm}. ৳${unitPrice.toFixed(2)} per unit.`,
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `https://mednest.com.bd/drugs/${slug}` },
  };
}

export default async function DrugDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const drug = await getDrugDetail(slug);
  if (!drug) notFound();

  const [alternateVersions, alternateBrands] = await Promise.all([
    getAlternateBrands(drug.genericName, slug, drug.dosageForm, drug.company || undefined),
    getAlternateBrands(drug.genericName, slug, drug.dosageForm, undefined, drug.company || undefined),
  ]);

  const Icon = getDosageIcon(drug.dosageForm);
  const unitPrice = parseFloat(String(drug.price).replace(/[^0-9.]/g, "")) || 0;
  const companySlug = drug.company?.toLowerCase().replace(/\s+/g, "-") || "";

  return (
    <div className="bg-gradient-to-b from-[#c5e0db] via-[#d5e9e7] to-[#e5f2ef] min-h-screen">
      <div className="max-w-[1024px] mx-auto px-3 sm:px-0 py-6">

        <div className="flex items-center gap-2 text-[14px] text-gray-500 mb-4 px-1">
          <Link href="/" className="hover:text-teal-600">Home</Link>
          <span>/</span>
          <Link href="/drugs" className="hover:text-teal-600">Drugs</Link>
          <span>/</span>
          <span className="text-gray-800 font-semibold truncate">{drug.brandName}</span>
        </div>

        <div className="bg-white rounded-2xl border border-sky-200 shadow-[8px_16px_40px_rgba(0,0,0,0.15),0_20px_60px_-12px_rgba(0,0,0,0.25)] p-7 sm:p-9 overflow-visible">

          {/* ===== HERO ===== */}
          <div className="flex gap-5">
            {/* Info + Pricing — icon inline with brand name */}
            <div className="flex-1 min-w-0">
              {/* Name + Strength + Pronunciation + Icon */}
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-[26px] sm:text-[32px] font-bold text-gray-900 leading-tight">{drug.brandName}</h1>
                <span className="text-[17px] sm:text-[19px] font-semibold text-gray-600">{drug.strength}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-teal-600 shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider leading-tight">{drug.dosageForm}</span>
                </div>
                {drug.pronunciation && <span className="text-[14px] text-gray-400 italic w-full">({drug.pronunciation})</span>}
              </div>
              {/* Generic + Route */}
              <div className="flex items-center gap-2 mt-1">
                <Link href={`/drugs?search=${encodeURIComponent(drug.genericName)}`} className="text-[16px] font-semibold text-teal-600 hover:underline truncate max-w-[200px] sm:max-w-[300px] inline-block align-bottom" title={drug.genericName}>{drug.genericName}</Link>
                <span className="text-gray-300">|</span>
                <span className="text-[15px] text-gray-500">Oral</span>
              </div>
              {/* Drug Class + Company + Ratings — all inline pills */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {drug.drugClass && (
                  <Link href={`/drugs?drug_class=${encodeURIComponent(drug.drugClass)}`} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[12px] font-bold text-teal-700 hover:bg-teal-100 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A1.994 1.994 0 0 1 3 12V7a4 4 0 0 1 4-4z"/></svg>
                    {drug.drugClass}
                  </Link>
                )}
                {drug.company && (
                  <Link href={`/companies/${companySlug}`} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-[12px] font-medium text-gray-600 hover:text-teal-600 hover:border-teal-200 transition-colors">
                    {drug.company}
                  </Link>
                )}
              </div>

              {/* Pricing — directly below company/pills */}
              {unitPrice > 0 && (
                <div className="mt-2 overflow-x-auto">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="inline-flex items-center gap-2 sm:gap-3 bg-teal-50 border border-teal-200 rounded-lg px-2 sm:px-3 py-1.5 shrink-0">
                      <div className="text-center min-w-0">
                        <div className="text-[7px] sm:text-[8px] font-bold text-gray-500 uppercase tracking-widest">Unit</div>
                        <div className="text-[13px] sm:text-[17px] font-black text-gray-900 leading-none truncate">৳{unitPrice.toFixed(2)}</div>
                      </div>
                      <div className="w-px h-6 sm:h-7 bg-teal-200 shrink-0" />
                      <div className="text-center min-w-0">
                        <div className="text-[7px] sm:text-[8px] font-bold text-gray-500 uppercase tracking-widest">Strip (10)</div>
                        <div className="text-[13px] sm:text-[17px] font-black text-teal-700 leading-none truncate">৳{(unitPrice * 10).toFixed(2)}</div>
                      </div>
                      <div className="w-px h-6 sm:h-7 bg-teal-200 shrink-0" />
                      <div className="text-center min-w-0">
                        <div className="text-[7px] sm:text-[8px] font-bold text-gray-500 uppercase tracking-widest">Box (100)</div>
                        <div className="text-[11px] sm:text-[14px] font-bold text-gray-500 leading-none truncate">৳{(unitPrice * 100).toFixed(2)}</div>
                      </div>
                    </div>
                    <PrintButton />
                    {drug.darNumber && (
                      <span className="hidden sm:inline-block ml-3 text-[11px] text-gray-400 font-medium">DAR: {drug.darNumber}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Image — top right */}
            <div className="flex flex-col items-center justify-center sm:w-[180px] w-[80px] sm:h-[140px] h-[80px] rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-200 text-gray-300 shrink-0 group cursor-pointer hover:border-teal-300 hover:bg-teal-50/30 transition-all relative overflow-hidden">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-teal-400 transition-colors sm:w-[36px] sm:h-[36px] w-[20px] h-[20px]"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span className="text-[11px] mt-2 font-medium text-gray-400 group-hover:text-teal-500 transition-colors hidden sm:inline">{drug.brandName}</span>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="text-white text-[13px] font-bold flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  View image
                </span>
              </div>
            </div>
          </div>

          <hr className="my-4 border-gray-100" />

          {/* ===== ALTERNATE BRANDS + ALTERNATE VERSIONS (stacked) + DRUG STATUS (side) ===== */}
          <div className="flex flex-col lg:flex-row gap-6 mb-6 pb-6 border-b border-gray-100">
            <div className="flex-1 min-w-0 space-y-2">
              {/* Alternate Brands — different companies, same generic */}
              {alternateBrands.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-[17px] font-bold text-gray-900">Alternate Brands</h2>
                <Link href={`/drugs?generic=${encodeURIComponent(drug.genericName)}&dosage_form=${encodeURIComponent(drug.dosageForm)}`} className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500 hover:bg-teal-600 text-white font-bold text-[11px] transition-all hover:shadow-lg active:scale-95">
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {alternateBrands.slice(0, 2).map((brand: any) => {
                  const BrandIcon = getDosageIcon(brand.dosageForm || drug.dosageForm);
                  return (
                    <Link key={brand.slug} href={`/drugs/${brand.slug}`} className="group relative flex flex-col p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 hover:bg-amber-50 hover:border-amber-400 hover:shadow-[0_4px_12px_-4px_rgba(217,119,6,0.12)] hover:-translate-y-0.5 transition-all duration-200 before:absolute before:inset-x-3 before:top-0 before:h-0.5 before:rounded-b before:bg-amber-500 before:opacity-0 before:transition-all before:duration-200 group-hover:before:opacity-100">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-0.5 shrink-0 w-9">
                          <div className="w-9 h-9 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 group-hover:bg-amber-100 group-hover:scale-105 transition-all">
                            <BrandIcon className="w-[18px] h-[18px]" />
                          </div>
                          {brand.dosageForm && (() => {
                            const f = brand.dosageForm.toLowerCase();
                            const label = f.includes("tablet") ? "Tab" : f.includes("capsule") ? "Cap" : f.includes("syrup") ? "Syr" : f.includes("suspension") ? "Susp" : f.includes("drop") ? "Drop" : f.includes("injection") || f.includes("infusion") ? "Inj" : f.includes("sachet") ? "Sach" : f.includes("cream") || f.includes("ointment") ? "Crm" : f.includes("spray") ? "Spr" : f.includes("powder") ? "Pwd" : f.includes("suppository") ? "Sup" : f.split(" ")[0];
                            return <span className="text-[7px] font-bold text-amber-600 uppercase tracking-wider text-center leading-tight">{label}</span>;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-gray-800 group-hover:text-amber-700 truncate transition-colors">{brand.brandName}</p>
                          <p className="text-[11px] text-gray-600 truncate">{brand.strength}</p>
                          {brand.company && <p className="text-[10px] text-gray-500 truncate">{brand.company}</p>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
            )}

            {/* Alternate Versions — same company, same generic, different strength */}
            {alternateVersions.length > 0 && (
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-[17px] font-bold text-gray-900">Alternate Versions</h2>
                <Link href={`/drugs?generic=${encodeURIComponent(drug.genericName)}&dosage_form=${encodeURIComponent(drug.dosageForm)}&company=${encodeURIComponent(drug.company || '')}`} className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500 hover:bg-teal-600 text-white font-bold text-[11px] transition-all hover:shadow-lg active:scale-95">
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {alternateVersions.slice(0, 2).map((brand: any) => {
                  const BrandIcon = getDosageIcon(brand.dosageForm || drug.dosageForm);
                  return (
                    <Link key={brand.slug} href={`/drugs/${brand.slug}`} className="group relative flex flex-col p-3.5 rounded-xl border border-teal-200 bg-teal-50/40 hover:bg-teal-50 hover:border-teal-400 hover:shadow-[0_4px_12px_-4px_rgba(0,150,136,0.15)] hover:-translate-y-0.5 transition-all duration-200 before:absolute before:inset-x-3 before:top-0 before:h-0.5 before:rounded-b before:bg-teal-500 before:opacity-0 before:transition-all before:duration-200 group-hover:before:opacity-100">
                      {/* Verified badge top-right */}
                      <span className="absolute top-1.5 right-1.5 z-10 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" title="DGDA Verified">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/><path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-0.5 shrink-0 w-9">
                          <div className="w-9 h-9 rounded-xl bg-white border border-teal-200 flex items-center justify-center text-teal-600 group-hover:bg-teal-100 group-hover:scale-105 transition-all">
                            <BrandIcon className="w-[18px] h-[18px]" />
                          </div>
                          {brand.dosageForm && (() => {
                            const f = brand.dosageForm.toLowerCase();
                            const label = f.includes("tablet") ? "Tab" : f.includes("capsule") ? "Cap" : f.includes("syrup") ? "Syr" : f.includes("suspension") ? "Susp" : f.includes("drop") ? "Drop" : f.includes("injection") || f.includes("infusion") ? "Inj" : f.includes("sachet") ? "Sach" : f.includes("cream") || f.includes("ointment") ? "Crm" : f.includes("spray") ? "Spr" : f.includes("powder") ? "Pwd" : f.includes("suppository") ? "Sup" : f.split(" ")[0];
                            return <span className="text-[7px] font-bold text-teal-600 uppercase tracking-wider text-center leading-tight">{label}</span>;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-gray-800 group-hover:text-teal-700 truncate transition-colors">{brand.brandName}</p>
                          <p className="text-[11px] text-gray-600 truncate">{brand.strength}</p>
                        {brand.averageRating > 0 && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 shrink-0">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#D97706" stroke="#D97706" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            {brand.averageRating}
                          </span>
                        )}
                      </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
            )}

            </div>

            {/* Drug Status + User Reviews */}
            <div className="flex flex-col gap-5 lg:w-[300px] lg:shrink-0">
              <div className="rounded-xl border-2 border-emerald-200 bg-white overflow-hidden shadow-sm h-full">
              <div className="bg-emerald-800 px-3 py-2">
                <h3 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  Drug Status
                </h3>
              </div>
              <div className="p-2.5 space-y-0">
                <div className="flex items-center gap-2 py-1 border-b border-gray-100">
                  <span className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/><path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                  <div><div className="text-[13px] font-bold text-gray-900">DGDA Verified</div><div className="text-[11px] text-gray-500">Bangladesh approved</div></div>
                </div>
                <div className="flex items-center gap-2 py-1 border-b border-gray-100">
                  <span className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                  <div><div className="text-[13px] font-bold text-gray-900">Prescription Required</div><div className="text-[11px] text-gray-500">Rx medication</div></div>
                </div>
                {drug.pregnancyCategory && drug.pregnancyCategory !== "Information not available." && (
                  <div className="flex items-center gap-2 py-1 border-b border-gray-100">
                    <span className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
                    <div><div className="text-[13px] font-bold text-gray-900">Pregnancy Category {drug.pregnancyCategory}</div><div className="text-[11px] text-gray-500">Pregnancy &amp; Lactation</div></div>
                  </div>
                )}
                {drug.darNumber && (
                  <div className="flex items-center gap-2 py-1 border-b border-gray-100">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                    <div><div className="text-[13px] font-bold text-gray-900">DAR: {drug.darNumber}</div><div className="text-[11px] text-gray-500">Authorization No.</div></div>
                  </div>
                )}
                {drug.csaSchedule && drug.csaSchedule !== "Information not available." && (
                  <div className="flex items-center gap-2 py-1 border-b border-gray-100">
                    <span className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span>
                    <div><div className="text-[13px] font-bold text-gray-900">{drug.csaSchedule}</div><div className="text-[11px] text-gray-500">CSA Schedule</div></div>
                  </div>
                )}
                {drug.halfLife && drug.halfLife !== "Information not available." && (
                  <div className="flex items-center gap-3 py-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
                    <div><div className="text-[13px] font-bold text-gray-900">{drug.halfLife}</div><div className="text-[11px] text-gray-500">Half-Life</div></div>
                  </div>
                )}
                {/* DAR Number — always show */}
                <div className="flex items-center gap-2 py-1 border-b border-gray-100">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                  <div><div className="text-[13px] font-bold text-gray-900">{drug.darNumber || "N/A"}</div><div className="text-[11px] text-gray-500">DAR Authorization</div></div>
                </div>
              </div>
              {/* User Reviews & Ratings — inside status card, green bar style */}
              <div className="border-t border-gray-100">
                <div className="flex items-center justify-between px-4 py-2.5 bg-teal-50/50">
                  <span className="text-[12px] font-semibold text-teal-700">User Reviews &amp; Ratings</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] font-bold text-teal-800">{drug.averageRating || 0}</span>
                    <span className="text-[11px] text-teal-600">/ 10</span>
                    <span className="text-[11px] text-teal-500">· {drug.reviewCount || 0} Review{(drug.reviewCount || 0) !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* ===== IN-PAGE NAV ===== */}
          <div className="-mx-7 sm:-mx-9 px-7 sm:px-9 py-2 border-b border-gray-100/50">
          <div className="flex gap-1.5 flex-wrap">
            {[
              { id: "uses", label: "Uses" },
              { id: "side-effects", label: "Side Effects" },
              { id: "warnings", label: "Warnings" },
              { id: "dosage", label: "Dosage" },
              { id: "before-taking", label: "Before Taking" },
              { id: "interactions", label: "Interactions" },
              { id: "faq", label: "FAQ" },
            ].map(s => (
              <a key={s.id} href={`#section-${s.id}`} className="shrink-0 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[11px] sm:text-[14px] font-bold border-2 border-teal-300 text-teal-700 hover:bg-teal-100 hover:border-teal-500 transition-colors shadow-sm hover:shadow-md">
                {s.label}
              </a>
            ))}
          </div>
          </div>

          {/* ===== FULL-WIDTH MEDICAL CONTENT ===== */}
          <div className="max-w-none space-y-6 mt-3">

            {/* Uses */}
            <section id="section-uses" className="scroll-mt-24 target:bg-teal-50/60 target:rounded-lg transition-all duration-300">
              <CollapsibleSection title={`What is ${drug.brandName} used for?`}>
                {drug.indications !== "Information not available." && <p className="mb-4">{drug.indications}</p>}
                {drug.whatIs !== "Information not available." && (
                  <div>
                    <h3 className="text-[16px] font-bold text-gray-900 mb-1">What is {drug.brandName}?</h3>
                    <p>{drug.whatIs}</p>
                  </div>
                )}
              </CollapsibleSection>
            </section>

            {/* Side Effects */}
            {drug.sideEffects !== "Information not available." && (
              <section id="section-side-effects" className="scroll-mt-24 target:bg-teal-50/60 target:rounded-lg transition-all duration-300">
                <CollapsibleSection title="Side Effects">
                  <p>{drug.sideEffects}</p>
                  {drug.overdoseEffects !== "Information not available." && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h3 className="text-[16px] font-bold text-gray-900 mb-2">Overdose Effects</h3>
                      <p>{drug.overdoseEffects}</p>
                    </div>
                  )}
                </CollapsibleSection>
              </section>
            )}

            {/* Warnings */}
            {drug.warnings !== "Information not available." && (
              <section id="section-warnings" className="scroll-mt-24 target:bg-teal-50/60 target:rounded-lg transition-all duration-300">
                <CollapsibleSection title="Warnings & Precautions" icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                }>
                  <div className="mb-4">
                    <p className="text-[14px] lg:text-[15px] text-gray-700 leading-[1.55]">{drug.warnings}</p>
                  </div>
                  {drug.precautions !== "Information not available." && (
                  <div className="mb-4">
                      <h3 className="text-[16px] font-bold text-gray-900 mb-2">Precautions</h3>
                      <p className="text-[14px] lg:text-[15px] text-gray-700 leading-[1.55]">{drug.precautions}</p>
                  </div>
                  )}
                  {drug.alcoholWarning !== "Information not available." && (
                    <div className="flex gap-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 shrink-0 mt-0.5"><path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/></svg>
                      <div className="text-[14px] lg:text-[15px] text-gray-700 leading-[1.55]">
                        <strong className="text-gray-900">Alcohol Warning</strong><br/>{drug.alcoholWarning}
                      </div>
                    </div>
                  )}
                </CollapsibleSection>
              </section>
            )}

            {/* Dosage */}
            {drug.dosage !== "Information not available." && (
              <section id="section-dosage" className="scroll-mt-24 target:bg-teal-50/60 target:rounded-lg transition-all duration-300">
                <CollapsibleSection title="Dosage & Administration">
                  <p>{drug.dosage}</p>
                  {drug.monitoring !== "Information not available." && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h3 className="text-[16px] font-bold text-gray-900 mb-2">Monitoring</h3>
                      <p className="text-[14px] lg:text-[15px] text-gray-700 leading-[1.55]">{drug.monitoring}</p>
                    </div>
                  )}
                  {drug.storageConditions !== "Information not available." && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h3 className="text-[16px] font-bold text-gray-900 mb-2">Storage Conditions</h3>
                      <p className="text-[14px] lg:text-[15px] text-gray-700 leading-[1.55]">{drug.storageConditions}</p>
                    </div>
                  )}
                </CollapsibleSection>
              </section>
            )}

            {/* Before Taking */}
            <section id="section-before-taking" className="scroll-mt-24 target:bg-teal-50/60 target:rounded-lg transition-all duration-300">
              <CollapsibleSection title="Before Taking">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {drug.pregnancyCategory && drug.pregnancyCategory !== "Information not available." && (
                    <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                      <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Pregnancy</div>
                      <div className="text-[16px] font-bold text-gray-900">Category {drug.pregnancyCategory}</div>
                    </div>
                  )}
                  {drug.csaSchedule && drug.csaSchedule !== "Information not available." && (
                    <div className="rounded-lg bg-purple-50 border border-purple-100 p-3">
                      <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider mb-0.5">CSA Schedule</div>
                      <div className="text-[16px] font-bold text-gray-900">{drug.csaSchedule}</div>
                    </div>
                  )}
                  {drug.halfLife && drug.halfLife !== "Information not available." && (
                    <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                      <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">Half-Life</div>
                      <div className="text-[16px] font-bold text-gray-900">{drug.halfLife}</div>
                    </div>
                  )}
                  {drug.darNumber && (
                    <div className="rounded-lg bg-teal-50 border border-teal-100 p-3">
                      <div className="text-[11px] font-bold text-teal-700 uppercase tracking-wider mb-0.5">DGDA DAR</div>
                      <div className="text-[16px] font-bold text-gray-900">{drug.darNumber}</div>
                    </div>
                  )}
                </div>
                {drug.contraindications !== "Information not available." && (
                  <div className="mb-4">
                    <h3 className="text-[16px] font-bold text-gray-900 mb-2">Contraindications</h3>
                    <p className="text-[14px] lg:text-[15px] text-gray-700 leading-[1.55]">{drug.contraindications}</p>
                  </div>
                )}
                {drug.pregnancyLactation !== "Information not available." && (
                  <div>
                    <h3 className="text-[16px] font-bold text-gray-900 mb-2">Pregnancy & Lactation</h3>
                    <p className="text-[14px] lg:text-[15px] text-gray-700 leading-[1.55]">{drug.pregnancyLactation}</p>
                  </div>
                )}
              </CollapsibleSection>
            </section>

            {/* Interactions */}
            {drug.interactions !== "Information not available." && (
              <section id="section-interactions" className="scroll-mt-24 target:bg-teal-50/60 target:rounded-lg transition-all duration-300">
                <CollapsibleSection title="Drug Interactions">
                  <p className="mb-3">{drug.interactions}</p>
                  {drug.pharmacology !== "Information not available." && <p className="mb-3">{drug.pharmacology}</p>}
                  {drug.modeOfAction !== "Information not available." && <p>{drug.modeOfAction}</p>}
                </CollapsibleSection>
              </section>
            )}

            {/* FAQ */}
            <section id="section-faq" className="scroll-mt-24 target:bg-teal-50/60 target:rounded-lg transition-all duration-300">
              <div>
                <h2 className="text-[20px] font-bold text-gray-900 mb-3 pl-3 relative before:absolute before:left-0 before:top-0.5 before:bottom-0.5 before:w-1 before:rounded-r before:bg-teal-500">Frequently Asked Questions</h2>
                {drug.commonQuestions?.length > 0 ? (
                  <div className="space-y-2">
                    {drug.commonQuestions.map((faq: {question: string; answer: string}, i: number) => (
                      <details key={i} className="group rounded-xl border border-gray-200 overflow-hidden">
                        <summary className="cursor-pointer px-4 py-3.5 font-semibold text-gray-800 text-[16px] flex items-center justify-between list-none hover:bg-gray-50 transition-colors">
                          {faq.question}
                          <svg className="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                        </summary>
                        <div className="px-4 pb-4 text-[16px] text-gray-600 leading-[1.7] bg-gray-50/50">{faq.answer}</div>
                      </details>
                    ))}
                  </div>
                ) : (
                  <p className="text-[16px] text-gray-500">No FAQs available.</p>
                )}
              </div>
            </section>

            <p className="text-[14px] text-gray-400 leading-relaxed text-center pt-2">
              This information is for educational purposes only. Always consult your physician or pharmacist.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
