import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCompanyData(slug: string) {
  const name = slug.replace(/-/g, " ").replace(/\s+/g, " ").trim();

  const info = await db.execute(sql`
    SELECT * FROM companies WHERE slug ILIKE ${slug} OR name ILIKE ${name}
    LIMIT 1
  `);

  const companyId = info.rows[0]?.id as string | undefined;

  const brandStats = await db.execute(sql`
    SELECT
      COUNT(DISTINCT b.id)::int as brand_count,
      COUNT(DISTINCT b.generic_name)::int as generic_count,
      COUNT(DISTINCT b.therapeutic_class)::int as class_count,
      COUNT(DISTINCT b.dosage_form)::int as form_count,
      ROUND(AVG(b.average_rating)::numeric, 1)::float as avg_rating
    FROM brands b
    ${companyId ? sql`WHERE b.company_id = ${companyId}` : sql`WHERE b.company_name ILIKE ${name}`}
  `);

  if (!info.rows[0] && brandStats.rows[0]?.brand_count === 0) return null;

  const company = info.rows[0] as any || {};
  const stats = brandStats.rows[0] as any;

  return { company, stats };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCompanyData(slug);
  if (!data) return { title: "Company Not Found" };
  const { company, stats } = data;
  return {
    title: `${company.name || slug.replace(/-/g, " ")} - Pharmaceutical Company in Bangladesh | Med-Nest`,
    description: `${company.name || slug.replace(/-/g, " ")} - ${stats.brand_count} brands, ${stats.generic_count} generics. Complete list of medicines manufactured in Bangladesh.`,
    openGraph: {
      title: `${company.name || slug.replace(/-/g, " ")} - Pharmaceutical Company`,
      description: `Browse all ${stats.brand_count} brands including prices, generics, and dosage forms.`,
      type: "article",
      siteName: "Med-Nest",
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `https://mednest.com.bd/companies/${slug}` },
  };
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCompanyData(slug);
  if (!data) notFound();

  const { company, stats } = data;
  const displayName = company.name || slug.replace(/-/g, " ");
  const foundedYear = company.founded_year;
  const about = company.about;
  const mission = company.mission;
  const vision = company.vision;
  const phone = company.phone;
  const email = company.email;
  const website = company.website;
  const address = company.address;
  const city = company.city;
  const ceo = company.ceo;
  const employees = company.employees;
  const marketShare = company.market_share;
  const revenue = company.revenue;
  const licenseBiological = company.license_no_biological || company.licenseNoBiological;
  const licenseNonBiological = company.license_no_non_biological || company.licenseNoNonBiological;
  const dgdaStatus = company.dgda_status || company.dgdaStatus;
  const facilities = company.facilities;
  const certifications = company.certifications;
  const exportMarkets = company.export_markets;

  const hasContact = !!(phone || email || website);
  const hasBusiness = !!(ceo || employees || revenue || foundedYear || marketShare);
  const hasDetails = !!(about || mission || vision);
  const hasExtra = !!(facilities?.length || certifications?.length || exportMarkets?.length);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#c5e0db] via-[#d5e9e7] to-[#e5f2ef]">
      <div className="max-w-[1024px] mx-auto px-3 sm:px-0 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4 px-1">
          <Link href="/" className="hover:text-teal-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/companies" className="hover:text-teal-600 transition-colors">Companies</Link>
          <span>/</span>
          <span className="text-gray-800 font-semibold truncate">{displayName}</span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-sky-200 shadow-[8px_16px_40px_rgba(0,0,0,0.15),0_20px_60px_-12px_rgba(0,0,0,0.25)] overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 p-6 sm:p-10 text-white">
            <div className="flex items-start gap-5 flex-wrap sm:flex-nowrap">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                  {company.logo_url ? (
                    <Image src={company.logo_url} alt={displayName} width={96} height={96} className="w-full h-full object-contain p-2" unoptimized />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
                      <path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/>
                      <path d="M9 9h1"/><path d="M9 13h1"/><path d="M14 9h1"/><path d="M14 13h1"/>
                    </svg>
                  )}
                </div>
                {foundedYear && (
                  <span className="sm:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-[10px] font-semibold">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Since {foundedYear}
                  </span>
                )}
                {(licenseBiological || licenseNonBiological) && (
                  <span className="sm:hidden flex flex-col items-center text-[9px] text-teal-200/70 leading-tight mt-0.5">
                    {licenseBiological && <span>Bio: {licenseBiological}</span>}
                    {licenseNonBiological && <span>Non-Bio: {licenseNonBiological}</span>}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">{displayName}</h1>
                    <p className="text-teal-100 text-sm sm:text-base mt-1">Pharmaceutical Company in Bangladesh</p>
                    {address && (
                      <p className="text-teal-200/80 text-xs sm:text-sm mt-1.5 flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {address}{city ? `, ${city}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                    {foundedYear && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-xs font-semibold">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        Since {foundedYear}
                      </span>
                    )}
                    {(licenseBiological || licenseNonBiological) && (
                      <span className="flex flex-col items-end text-[10px] text-teal-200/70 leading-tight">
                        {licenseBiological && <span>Bio: {licenseBiological}</span>}
                        {licenseNonBiological && <span>Non-Bio: {licenseNonBiological}</span>}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-gray-100">
            <Link
              href={`/drugs?company=${encodeURIComponent(displayName)}`}
              className="relative flex items-center gap-3 px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors group border-r border-gray-100 cursor-pointer before:absolute before:inset-x-3 before:top-0 before:h-[3px] before:rounded-b before:bg-teal-500"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-white border border-gray-100 group-hover:border-teal-200 flex items-center justify-center shrink-0 transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-teal-600 transition-colors">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M8 2h8v4H8z"/>
                </svg>
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-teal-600">{stats.brand_count}</div>
                <div className="text-[11px] text-gray-500 font-medium">Total Brands</div>
              </div>
            </Link>
            {[
              { label: "Generics", value: stats.generic_count, color: "text-amber-600", icon: "M19.428 15.428a2 2 0 0 0-1.022-.547l-2.387-.477a6 6 0 0 0-3.86.517l-.318.158a6 6 0 0 1-3.86.517L6.05 15.21a2 2 0 0 0-1.806.547M8 4h8l-1 1v5.172a2 2 0 0 0 .586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 0 0 9 10.172V5L8 4z" },
              { label: "Drug Classes", value: stats.class_count, color: "text-blue-600", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 0 1 0 2.828l-7 7a2 2 0 0 1-2.828 0l-7-7A1.994 1.994 0 0 1 3 12V7a4 4 0 0 1 4-4z" },
              { label: "Dosage Forms", value: stats.form_count, color: "text-purple-600", icon: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2 M8 2h8v4H8z M12 11v4 M10 13h4" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 px-4 sm:px-6 py-4 border-r border-gray-100 last:border-r-0">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <path d={stat.icon}/>
                  </svg>
                </div>
                <div>
                  <div className={`text-lg sm:text-xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-[11px] text-gray-500 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* About & Mission/Vision */}
          {hasDetails && (
            <div className="p-6 sm:p-8 space-y-6 border-b border-gray-100">
              {about && (
                <div>
                  <h2 className="text-lg font-bold text-navy mb-3 flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
                      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                    </svg>
                    About
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{about}</p>
                </div>
              )}

              {(mission || vision) && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {mission && (
                    <div className="rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 p-5">
                      <h3 className="font-bold text-teal-800 text-sm mb-2 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        Our Mission
                      </h3>
                      <p className="text-sm text-teal-700/80 leading-relaxed">{mission}</p>
                    </div>
                  )}
                  {vision && (
                    <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 p-5">
                      <h3 className="font-bold text-amber-800 text-sm mb-2 flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        Our Vision
                      </h3>
                      <p className="text-sm text-amber-700/80 leading-relaxed">{vision}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Business Info */}
          {hasBusiness && (
            <div className="p-6 sm:p-8 border-b border-gray-100">
              <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                Business Information
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(foundedYear || marketShare) && (
                  <div className="relative rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 p-4 flex flex-col items-center justify-center text-center before:absolute before:inset-x-3 before:top-0 before:h-[3px] before:rounded-b before:bg-teal-500">
                    <div className="text-xs text-teal-600 font-medium mb-1">Founded</div>
                    <div className="text-lg font-bold text-teal-800">{foundedYear || "—"}</div>
                    {marketShare && (
                      <div className="mt-2 pt-2 border-t border-teal-200 w-full">
                        <div className="text-xs text-teal-600 font-medium mb-0.5">Market Share</div>
                        <div className="text-sm font-bold text-teal-800">{marketShare}</div>
                      </div>
                    )}
                  </div>
                )}
                {ceo && (
                  <div className="relative rounded-xl bg-gray-50 border border-gray-100 p-4 before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-r before:bg-blue-500">
                    <div className="text-xs text-gray-500 font-medium mb-1">CEO / MD</div>
                    <div className="text-sm font-bold text-gray-800 truncate" title={ceo}>{ceo}</div>
                  </div>
                )}
                {employees && (
                  <div className="relative rounded-xl bg-gray-50 border border-gray-100 p-4 before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-r before:bg-amber-500">
                    <div className="text-xs text-gray-500 font-medium mb-1">Employees</div>
                    <div className="text-sm font-bold text-gray-800">{employees.toLocaleString()}</div>
                  </div>
                )}
                {revenue && (() => {
                  const parts = revenue.split(/\(|\)/).filter(Boolean).map((s: string) => s.trim());
                  const bdt = parts[0] || revenue;
                  const usd = parts[1] || null;
                  return (
                    <div className="relative rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 p-4 flex flex-col items-center justify-center text-center before:absolute before:inset-x-3 before:top-0 before:h-[3px] before:rounded-b before:bg-emerald-500">
                      <div className="text-xs text-emerald-600 font-medium mb-1">Revenue</div>
                      <div className="text-sm font-bold text-emerald-800">{bdt}</div>
                      {usd && (
                        <div className="mt-1.5 pt-1.5 border-t border-emerald-200 w-full">
                          <div className="text-xs text-emerald-600 font-medium mb-0.5">USD Equivalent</div>
                          <div className="text-sm font-bold text-emerald-800">{usd}</div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Contact */}
          {hasContact && (
            <div className="p-6 sm:p-8 border-b border-gray-100">
              <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Contact
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {phone && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Phone</div>
                      <div className="text-sm text-gray-700">{phone}</div>
                    </div>
                  </div>
                )}
                {email && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Email</div>
                      <div className="text-sm text-teal-600 hover:underline">
                        <a href={`mailto:${email}`}>{email}</a>
                      </div>
                    </div>
                  </div>
                )}
                {website && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
                        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium">Website</div>
                      <a href={website.startsWith("http") ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:underline">
                        {website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Facilities & Certifications */}
          {hasExtra && (
            <div className="p-6 sm:p-8 border-b border-gray-100">
              <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Certifications & Facilities
              </h2>
              <div className="space-y-4">
                {certifications?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {certifications.map((cert: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-semibold">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {cert}
                      </span>
                    ))}
                  </div>
                )}
                {facilities?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {facilities.map((fac: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                        </svg>
                        {fac}
                      </span>
                    ))}
                  </div>
                )}
                {exportMarkets?.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 font-medium mb-2">Export Markets</div>
                    <div className="flex flex-wrap gap-2">
                      {exportMarkets.map((mkt: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                          {mkt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="p-6 sm:p-8 text-center bg-gradient-to-r from-teal-50 to-teal-100/50">
            <Link
              href={`/drugs?company=${encodeURIComponent(displayName)}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
              View All {stats.brand_count} Brands
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
