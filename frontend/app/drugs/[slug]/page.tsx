import { notFound } from "next/navigation";
import { getDrugDetail } from "@/lib/services/detailService";
import { drugService } from "@/lib/services/drugService";
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
import { 
  TabletIcon, 
  PillIcon, 
  SyrupIcon, 
  IVDripIcon, 
  DropsIcon, 
  InhalerIcon 
} from "@/components/ui/MedicalIcons";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const getDosageIcon = (form: string, size = 48) => {
  const f = form.toLowerCase();
  if (f.includes("tablet")) return <TabletIcon size={size} className="text-[#2D8A7D]" />;
  if (f.includes("capsule")) return <PillIcon size={size} className="text-[#2D8A7D]" />;
  if (f.includes("syrup") || f.includes("suspension")) return <SyrupIcon size={size} className="text-[#2D8A7D]" />;
  if (f.includes("drop")) return <DropsIcon size={size} className="text-[#2D8A7D]" />;
  if (f.includes("injection") || f.includes("infusion")) return <IVDripIcon size={size} className="text-[#2D8A7D]" />;
  if (f.includes("inhaler")) return <InhalerIcon size={size} className="text-[#2D8A7D]" />;
  return <PillIcon size={size} className="text-[#2D8A7D]" />;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const drug = await getDrugDetail(slug);
  return {
    title: drug ? `${drug.brandName} - Price in Bangladesh | ${drug.strength}` : "Medicine Not Found",
    description: drug ? `Price and detailed information for ${drug.brandName} (${drug.genericName}) in Bangladesh.` : "Medicine details not found.",
  };
}

export default async function DrugDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [drug, allDrugsResponse] = await Promise.all([
    getDrugDetail(slug),
    drugService.getDrugs({ limit: 1000 })
  ]);

  if (!drug) notFound();

  const unitPrice = parseFloat(drug.price.replace(/[^0-9.]/g, '')) || 0;
  const stripPrice = (unitPrice * 10).toFixed(2);
  const boxPrice = (unitPrice * 100).toFixed(2);
  
  const alternateBrands = allDrugsResponse.drugs
    .filter((d: any) => d.genericName === drug.genericName && d.slug !== slug)
    .sort((a: any, b: any) => b.averageRating - a.averageRating)
    .slice(0, 10);

  const variations = allDrugsResponse.drugs.filter(
    (d: any) => d.brandName === drug.brandName && d.slug !== slug
  );

  return (
    <main className="container-medq py-6">
      {/* Header */}
      <section className="mb-8 border-b border-gray-100 pb-8">
        <div className="flex flex-col gap-1">
          {/* Top Level: Icon + Branding + Quick Facts */}
          <div className="flex items-start gap-6">
            <div className="p-4 bg-mint-soft rounded-2xl shrink-0 mt-1">
              {getDosageIcon(drug.dosageForm, 48)}
            </div>
            
            <div className="flex flex-1 items-start gap-10">
              <div className="flex-initial">
                {/* Branding Block */}
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

              {/* Quick Facts + Also available as + Placeholder */}
              <div className="flex flex-row gap-6 items-start">
                <Card className="shadow-none border border-gray-100 rounded-xl bg-white w-full max-w-[280px] h-fit ml-0">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-start mb-2">
                      <h3 className="font-black text-navy text-[10px] uppercase tracking-[0.15em] opacity-50 text-left">Quick Facts</h3>
                      <div className="w-10 h-0.5 bg-primary mt-1"></div>
                    </div>                  
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                      <div><p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Generic</p><Link href={`/drugs?search=${encodeURIComponent(drug.genericName)}`} className="font-bold text-primary hover:underline">{drug.genericName}</Link></div>
                      <div><p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Route</p><p className="font-bold text-navy">Oral</p></div>
                      <div><p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Class</p><Link href={`/drugs?class=${encodeURIComponent(drug.drugClass)}`} className="font-bold text-primary hover:underline">{drug.drugClass}</Link></div>
                      <div><p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Form / Str.</p><p className="font-bold text-navy">{drug.dosageForm} <span className="text-gray-400 font-medium">({drug.strength})</span></p></div>
                    </div>
                  </CardContent>
                </Card>

                {variations.length > 0 && (
                  <div className="space-y-3 max-w-[280px]">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Also available as</p>
                    <div className="flex flex-wrap gap-2">
                      {variations.map((v: any) => (
                        <Link key={v.slug} href={`/drugs/${v.slug}`}>
                          <Button variant="outline" className="h-9 border-[#2D8A7D] text-[#2D8A7D] bg-transparent hover:bg-[#EBF9F7] text-[12px] font-bold px-4 rounded-full">{v.strength} ({v.dosageForm})</Button>
                        </Link>
                      ))}                    </div>
                  </div>
                )}
                
                {/* Image Placeholder + Label */}
                <div className="flex flex-col gap-4 text-center">
                  <div title="View larger Image" className="bg-gray-50 border border-gray-100 rounded-2xl w-[200px] h-[150px] flex items-center justify-center text-gray-400 text-xs font-bold cursor-pointer transition-transform duration-300 hover:scale-125 hover:border-primary/30">Placeholder</div>
                  <p className="text-[11px] font-bold text-navy uppercase tracking-wider max-w-[200px] truncate mx-auto">{drug.brandName} <span className="text-gray-400">{drug.strength} {drug.dosageForm}</span></p>
                </div>
              </div>
            </div>
          </div>

              {/* Pricing Matrix */}
              <section className="mt-4 flex flex-col gap-2">
                <div className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden w-full max-w-[320px] mt-[-6.5rem]">
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
              </div>
            </TabsContent>
            {['dosage', 'warnings', 'side-effects', 'interactions', 'faqs', 'regulatory'].map((tabId) => (
              <TabsContent key={tabId} value={tabId} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="prose prose-slate max-w-none bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <h2 className="text-2xl font-black mb-4 text-navy uppercase">{tabId.replace('-', ' ')}</h2>
                  <p className="text-gray-600 italic text-sm">Information for {tabId.replace('-', ' ')} section of {drug.brandName} is being updated.</p>
                </div>
              </TabsContent>
            ))}
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
