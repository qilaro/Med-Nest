import { notFound } from "next/navigation";
import { getDrugDetail, getAlternateBrands, getVariations } from "@/lib/services/detailService";
import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Speaker, LayoutGrid } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import StarRating from "@/components/ui/StarRating";
import Link from "next/link";
import { slugify } from "@/lib/utils/slugify";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getDosageIcon } from "@/components/dosage-icons";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Icon display helper — uses getDosageIcon from dosage-icons

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const drug = await getDrugDetail(slug);
  if (!drug) return { title: 'Medicine Not Found' };
  return {
    title: `${drug.brandName} ${drug.strength} - Price in Bangladesh | Med-Nest`,
    description: `Find ${drug.brandName} ${drug.strength} price in Bangladesh. ${drug.genericName} by ${drug.company}. Uses, side effects, dosage, interactions and more.`,
    openGraph: {
      title: `${drug.brandName} ${drug.strength} - Price, Uses & Side Effects`,
      description: `${drug.brandName} (${drug.genericName}) - Complete medicine information with price in Bangladesh.`,
      type: 'article',
      locale: 'en_US',
      siteName: 'Med-Nest',
    },
    robots: { index: true, follow: true },
    alternates: { canonical: `https://mednest.com.bd/drugs/${slug}` },
  };
}

export default async function DrugDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const drug = await getDrugDetail(slug);

  if (!drug) notFound();

  const [alternateBrands, variations] = await Promise.all([
    getAlternateBrands(drug.genericName, slug),
    getVariations(drug.brandName, slug),
  ]);

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mednest.com.bd' },
          { '@type': 'ListItem', position: 2, name: 'Drugs', item: 'https://mednest.com.bd/drugs' },
          { '@type': 'ListItem', position: 3, name: drug.brandName, item: `https://mednest.com.bd/drugs/${slug}` },
        ],
      },
      {
        '@type': 'Drug',
        name: drug.brandName,
        description: `${drug.brandName} ${drug.strength} - ${drug.genericName}. Manufactured by ${drug.company}.`,
        activeIngredient: drug.genericName,
        manufacturer: drug.company,
        dosageForm: drug.dosageForm,
        url: `https://mednest.com.bd/drugs/${slug}`,
        offers: {
          '@type': 'Offer',
          price: drug.price?.replace(/[^0-9.]/g, '') || '',
          priceCurrency: 'BDT',
          availability: 'https://schema.org/InStock',
        },
      },
    ],
  };

  const unitPrice = parseFloat(String(drug.price).replace(/[^0-9.]/g, '')) || 0;
  const stripPrice = (unitPrice * 10).toFixed(2);
  const boxPrice = (unitPrice * 100).toFixed(2);

  return (
    <main className="container-medq py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Header */}
      <section className="mb-8 border-b border-gray-100 pb-8">
        <div className="flex flex-col gap-1">
          {/* Top Level: Icon + Branding + Quick Facts */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
            <div className="flex items-center gap-4 lg:block">
              <div className="p-3 lg:p-4 bg-mint-soft rounded-2xl shrink-0">
                {(() => { const Icon = getDosageIcon(drug.dosageForm); return <Icon className="w-8 h-8 lg:w-12 lg:h-12" />; })()}
              </div>
              
              <div className="lg:hidden">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h1 className="text-xl font-extrabold text-navy tracking-tight">{drug.brandName}</h1>
                    <span className="text-sm text-gray-400 font-medium">{drug.dosageForm}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/drugs?search=${encodeURIComponent(drug.genericName)}`} className="text-xs font-semibold text-[#2D8A7D] hover:underline">{drug.genericName}</Link>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500 font-medium">{drug.strength}</span>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">{drug.company}</p>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:flex flex-1 items-start gap-10">
              <div className="flex-initial">
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <h1 className="text-4xl font-extrabold text-navy tracking-tight">{drug.brandName}</h1>
                    <span className="text-xl text-gray-400 font-medium">{drug.dosageForm}</span>
                    <button className="text-gray-300 hover:text-primary transition-colors p-1.5"><Speaker size={20} /></button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/drugs?search=${encodeURIComponent(drug.genericName)}`} className="text-sm font-semibold text-[#2D8A7D] hover:underline">{drug.genericName}</Link>
                    <span className="text-gray-300 px-0.5">•</span>
                    <span className="text-sm text-gray-500 font-medium">{drug.strength}</span>
                  </div>
                  <p className="text-sm text-gray-400 font-medium">{drug.company}</p>
                </div>
              </div>

              <div className="flex flex-row gap-6 items-start">
                {/* Pricing Matrix — desktop inline */}
                <section className="flex flex-col gap-2">
                  <div className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden w-full max-w-[280px]">
                    <div className="flex items-center bg-gray-50/50 border-b border-gray-100">
                      <div className="flex-1 text-center py-2 border-r border-gray-100"><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Unit (1x)</p></div>
                      <div className="flex-1 text-center py-2 border-r border-gray-100"><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Strip (10x)</p></div>
                      <div className="flex-1 text-center py-2"><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Box (10x10)</p></div>
                    </div>
                    <div className="flex items-center">
                      <div className="flex-1 text-center py-3 border-r border-gray-100"><p className="text-base font-black text-navy leading-none">৳ {unitPrice.toFixed(2)}</p></div>
                      <div className="flex-1 text-center py-3 border-r border-gray-100"><p className="text-base font-black text-[#1A5F56] leading-none">৳ {stripPrice}</p></div>
                      <div className="flex-1 text-center py-3"><p className="text-sm font-bold text-gray-400 leading-none">৳ {boxPrice}</p></div>
                    </div>
                  </div>
                </section>

                {/* Image Placeholder + Label */}
                <div className="flex flex-col gap-4 text-center">
                  <div title="View larger Image" className="bg-gray-50 border border-gray-100 rounded-2xl w-[200px] h-[150px] flex items-center justify-center text-gray-400 text-xs font-bold cursor-pointer transition-transform duration-300 hover:scale-125 hover:border-primary/30">Placeholder</div>
                  <p className="text-[11px] font-bold text-navy uppercase tracking-wider max-w-[200px] truncate mx-auto">{drug.brandName} <span className="text-gray-400">{drug.strength} {drug.dosageForm}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Quick Facts + Variations + Pricing */}
          <div className="lg:hidden mt-4 space-y-4">
            {/* Pricing Matrix — mobile standalone */}
            <section className="flex flex-col gap-2">
              <div className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden w-full">
                <div className="flex items-center bg-gray-50/50 border-b border-gray-100">
                  <div className="flex-1 text-center py-2 border-r border-gray-100"><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Unit (1x)</p></div>
                  <div className="flex-1 text-center py-2 border-r border-gray-100"><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Strip (10x)</p></div>
                  <div className="flex-1 text-center py-2"><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Box (10x10)</p></div>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 text-center py-3 border-r border-gray-100"><p className="text-base font-black text-navy leading-none">৳ {unitPrice.toFixed(2)}</p></div>
                  <div className="flex-1 text-center py-3 border-r border-gray-100"><p className="text-base font-black text-[#1A5F56] leading-none">৳ {stripPrice}</p></div>
                  <div className="flex-1 text-center py-3"><p className="text-sm font-bold text-gray-400 leading-none">৳ {boxPrice}</p></div>
                </div>
              </div>
            </section>

            <div className="flex flex-wrap items-start gap-4">
              <Card className="shadow-none border border-gray-100 rounded-xl bg-white flex-1 min-w-[180px]">
                <CardContent className="p-4">
                  <div className="flex flex-col items-start mb-2">
                    <h3 className="font-black text-navy text-[10px] uppercase tracking-[0.15em] opacity-50 text-left">Quick Facts</h3>
                    <div className="w-10 h-0.5 bg-primary mt-1"></div>
                  </div>                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                    <div><p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Generic</p><Link href={`/drugs?search=${encodeURIComponent(drug.genericName)}`} className="font-bold text-primary hover:underline text-xs">{drug.genericName}</Link></div>
                    <div><p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Route</p><p className="font-bold text-navy text-xs">Oral</p></div>
                    <div><p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Class</p><Link href={`/drugs?class=${encodeURIComponent(drug.drugClass || '')}`} className="font-bold text-primary hover:underline text-xs">{drug.drugClass}</Link></div>
                    <div><p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Form / Str.</p><p className="font-bold text-navy text-xs">{drug.dosageForm} <span className="text-gray-400 font-medium">({drug.strength})</span></p></div>
                  </div>
                </CardContent>
              </Card>

                  {variations.length > 0 && (
                <div className="space-y-2 flex-1 min-w-[150px]">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Also available as</p>
                  <div className="flex flex-wrap gap-1.5">
                    {variations.map((v: any) => (
                      <Link key={v.slug} href={`/drugs/${v.slug}`}>
                        <Button variant="outline" className="h-8 border-[#2D8A7D] text-[#2D8A7D] bg-transparent hover:bg-[#EBF9F7] text-[11px] font-bold px-3 rounded-full">{v.brandName}</Button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container-medq grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-12">
          <section id="alternate-brands" className="pt-0">
            <div className="flex items-center mb-4">
              <h3 className="text-xl font-bold text-navy flex items-center gap-2"><LayoutGrid className="text-primary" size={20} /> Alternate Brands</h3>
              <div className="ml-auto">
                 <Link href={`/generics/${slugify(drug.genericName)}/alternate-brands`} className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">View all brands</Link>
              </div>
            </div>
            <div className="relative">
              <Carousel className="w-full">
                <CarouselContent className="-ml-3">
                  {alternateBrands.map((brand: any, index: number) => (
                    <CarouselItem key={brand.slug} className="pl-3 md:basis-1/2 lg:basis-1/2">
                      <Card className={`group relative overflow-hidden border-none h-full rounded-xl transition-all duration-300 hover:shadow-lg ${index === 0 ? "bg-mint-soft shadow-sm border-t-2 border-primary" : "bg-white border border-gray-100 shadow-sm"}`}>
                        {index === 0 && <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black px-3 py-1 rounded-bl-lg tracking-[0.1em] uppercase z-10">Top Rated</div>}
                        <CardContent className="p-4">
                          <h4 className="font-bold text-lg text-navy group-hover:text-primary transition-colors mb-0.5 leading-tight">{brand.brandName}</h4>
                          <p className="text-xs text-gray-400 font-medium mb-4">{brand.company}</p>
                          <div className="mb-4 p-2 bg-gray-50/80 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-black text-navy text-xl">{brand.averageRating} <span className="text-[10px] text-gray-400 font-normal">/ 10</span></span>
                              <div className="flex flex-col items-end"><span className="text-primary text-[9px] font-black uppercase tracking-wider">{brand.reviewCount} Reviews</span><StarRating rating={brand.averageRating} size="sm" /></div>
                            </div>
                            <Progress value={(brand.averageRating / 10) * 100} className="h-1 bg-gray-200" />
                          </div>
                          <Link href={`/drugs/${brand.slug}`}><Button className="w-full bg-navy hover:bg-navy/90 text-white font-bold h-9 rounded-lg transition-all active:scale-95 text-xs">View Details</Button></Link>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="h-10 w-10 border-none bg-white text-navy hover:bg-navy hover:text-white shadow-lg -left-5" />
                <CarouselNext className="h-10 w-10 border-none bg-white text-navy hover:bg-navy hover:text-white shadow-lg -right-5" />
              </Carousel>
            </div>
          </section>

          <Tabs defaultValue="indications" className="w-full">
            <TabsList className="grid grid-cols-4 md:grid-cols-7 h-14 bg-white p-1.5 border border-gray-100 rounded-2xl shadow-sm mb-8">
              {[
                {id: 'indications', label: 'Indications'}, 
                {id: 'dosage', label: 'Dosage'}, 
                {id: 'warnings', label: 'Warnings'}, 
                {id: 'side-effects', label: 'Side Effects'}, 
                {id: 'interactions', label: 'Interactions'}, 
                {id: 'faqs', label: 'FAQs'}, 
                {id: 'regulatory', label: 'Regulatory'}
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md rounded-xl py-3 font-black uppercase text-[10px] tracking-[0.15em] transition-all duration-300 text-gray-400 hover:text-navy"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="indications" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="prose prose-slate max-w-none bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black mb-4 text-navy">Indications & Usage</h2>
                <p className="text-gray-700 leading-relaxed text-sm font-medium">{drug.indications}</p>
                {drug.whatIs && drug.whatIs !== "Information not available." && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold mb-2 text-navy">What is {drug.brandName}?</h3>
                    <p className="text-gray-700 leading-relaxed text-sm font-medium">{drug.whatIs}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="dosage" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="prose prose-slate max-w-none bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black mb-4 text-navy">Dosage Information</h2>
                <p className="text-gray-700 leading-relaxed text-sm font-medium">{drug.dosage}</p>
                {drug.monitoring && drug.monitoring !== "Information not available." && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold mb-2 text-navy">Monitoring</h3>
                    <p className="text-gray-700 leading-relaxed text-sm font-medium">{drug.monitoring}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="warnings" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="prose prose-slate max-w-none bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black mb-4 text-navy">Warnings & Precautions</h2>
                <p className="text-gray-700 leading-relaxed text-sm font-medium">{drug.warnings}</p>
                {drug.precautions && drug.precautions !== "Information not available." && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold mb-2 text-navy">Precautions</h3>
                    <p className="text-gray-700 leading-relaxed text-sm font-medium">{drug.precautions}</p>
                  </div>
                )}
                {drug.alcoholWarning && drug.alcoholWarning !== "Information not available." && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold mb-2 text-navy">Alcohol Warning</h3>
                    <p className="text-gray-700 leading-relaxed text-sm font-medium">{drug.alcoholWarning}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="side-effects" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="prose prose-slate max-w-none bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black mb-4 text-navy">Side Effects</h2>
                <p className="text-gray-700 leading-relaxed text-sm font-medium">{drug.sideEffects}</p>
                {drug.overdoseEffects && drug.overdoseEffects !== "Information not available." && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold mb-2 text-navy">Overdose Effects</h3>
                    <p className="text-gray-700 leading-relaxed text-sm font-medium">{drug.overdoseEffects}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="interactions" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="prose prose-slate max-w-none bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black mb-4 text-navy">Drug Interactions</h2>
                <p className="text-gray-700 leading-relaxed text-sm font-medium">{drug.interactions}</p>
                {drug.pharmacology && drug.pharmacology !== "Information not available." && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold mb-2 text-navy">Pharmacology</h3>
                    <p className="text-gray-700 leading-relaxed text-sm font-medium">{drug.pharmacology}</p>
                  </div>
                )}
                {drug.modeOfAction && drug.modeOfAction !== "Information not available." && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold mb-2 text-navy">Mode of Action</h3>
                    <p className="text-gray-700 leading-relaxed text-sm font-medium">{drug.modeOfAction}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="faqs" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="prose prose-slate max-w-none bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black mb-4 text-navy">Frequently Asked Questions</h2>
                {drug.commonQuestions.length > 0 ? (
                  <div className="space-y-4">
                    {drug.commonQuestions.map((faq: {question: string; answer: string}, i: number) => (
                      <details key={i} className="group border border-gray-200 rounded-xl overflow-hidden">
                        <summary className="cursor-pointer px-5 py-4 font-bold text-navy text-sm flex items-center justify-between list-none hover:bg-gray-50 transition-colors">
                          {faq.question}
                          <svg className="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </summary>
                        <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">{faq.answer}</div>
                      </details>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <details className="group border border-gray-200 rounded-xl overflow-hidden">
                      <summary className="cursor-pointer px-5 py-4 font-bold text-navy text-sm flex items-center justify-between list-none hover:bg-gray-50 transition-colors">
                        What is {drug.brandName} used for?
                        <svg className="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </summary>
                      <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">{drug.indications}</div>
                    </details>
                    <details className="group border border-gray-200 rounded-xl overflow-hidden">
                      <summary className="cursor-pointer px-5 py-4 font-bold text-navy text-sm flex items-center justify-between list-none hover:bg-gray-50 transition-colors">
                        What are the side effects of {drug.brandName}?
                        <svg className="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </summary>
                      <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">{drug.sideEffects}</div>
                    </details>
                    <details className="group border border-gray-200 rounded-xl overflow-hidden">
                      <summary className="cursor-pointer px-5 py-4 font-bold text-navy text-sm flex items-center justify-between list-none hover:bg-gray-50 transition-colors">
                        How should I take {drug.brandName}?
                        <svg className="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </summary>
                      <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">{drug.dosage}</div>
                    </details>
                    <details className="group border border-gray-200 rounded-xl overflow-hidden">
                      <summary className="cursor-pointer px-5 py-4 font-bold text-navy text-sm flex items-center justify-between list-none hover:bg-gray-50 transition-colors">
                        Can I take {drug.brandName} with other medicines?
                        <svg className="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </summary>
                      <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">{drug.interactions}</div>
                    </details>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="regulatory" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="prose prose-slate max-w-none bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black mb-4 text-navy">Regulatory & Safety Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {drug.pregnancyCategory && drug.pregnancyCategory !== "Information not available." && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Pregnancy Category</p>
                      <p className="font-bold text-navy text-sm">{drug.pregnancyCategory}</p>
                    </div>
                  )}
                  {drug.csaSchedule && drug.csaSchedule !== "Information not available." && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">CSA Schedule</p>
                      <p className="font-bold text-navy text-sm">{drug.csaSchedule}</p>
                    </div>
                  )}
                  {drug.halfLife && drug.halfLife !== "Information not available." && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Half-Life</p>
                      <p className="font-bold text-navy text-sm">{drug.halfLife}</p>
                    </div>
                  )}
                  {drug.alcoholWarning && drug.alcoholWarning !== "Information not available." && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Alcohol Warning</p>
                      <p className="font-bold text-navy text-sm">{drug.alcoholWarning}</p>
                    </div>
                  )}
                </div>
                {drug.contraindications && drug.contraindications !== "Information not available." && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold mb-2 text-navy">Contraindications</h3>
                    <p className="text-gray-700 leading-relaxed text-sm font-medium">{drug.contraindications}</p>
                  </div>
                )}
                {drug.pregnancyLactation && drug.pregnancyLactation !== "Information not available." && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold mb-2 text-navy">Pregnancy & Lactation</h3>
                    <p className="text-gray-700 leading-relaxed text-sm font-medium">{drug.pregnancyLactation}</p>
                  </div>
                )}
                {drug.storageConditions && drug.storageConditions !== "Information not available." && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-bold mb-2 text-navy">Storage Conditions</h3>
                    <p className="text-gray-700 leading-relaxed text-sm font-medium">{drug.storageConditions}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="max-w-[320px] space-y-3">
          <Card className="shadow-lg border-none bg-navy text-white rounded-2xl overflow-hidden">
            <CardContent className="p-3">
              <h3 className="font-black text-sm mb-2 uppercase tracking-widest text-mint opacity-80">Ratings & Safety</h3>
              <div className="flex items-center gap-4 mb-2">
                <div className="text-4xl font-black text-white">{drug.averageRating}</div>
                <div className="space-y-0.5"><StarRating rating={drug.averageRating} size="sm" /><p className="text-[10px] font-bold text-mint-soft/60 uppercase tracking-wider">{drug.reviewCount} Verified Reviews</p></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs"><span className="font-medium opacity-70">Effectiveness</span><span className="font-black">94%</span></div>
                <Progress value={94} className="h-1.5 bg-white/10" />
                <div className="flex justify-between items-center text-xs pt-1"><span className="font-medium opacity-70">Safety Profile</span><span className="font-black">High</span></div>
                <Progress value={88} className="h-1.5 bg-white/10" />
              </div>
              <Button className="w-full mt-3 bg-mint text-navy hover:bg-white font-black h-10 rounded-xl transition-all shadow-md text-sm">Write a Review</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
