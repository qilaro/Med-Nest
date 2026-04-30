import { drugService } from "@/lib/services/drugService";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import DrugCard from "@/components/drugs/DrugCard";
import { Card, CardContent } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ genericSlug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { genericSlug } = await params;
  const name = genericSlug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  return {
    title: `${name} Brand Names in Bangladesh | Alternate Brands`,
  };
}

export default async function GenericBrandsPage({ params, searchParams }: PageProps) {
  const { genericSlug } = await params;
  
  const allDrugs = await drugService.getDrugs({ limit: 1000 });
  
  // Find all drugs matching the generic (slug-based match)
  const brands = allDrugs.drugs.filter(
    d => d.genericName.toLowerCase().replace(/\s+/g, '-') === genericSlug
  );

  if (brands.length === 0) notFound();

  const genericName = brands[0].genericName;
  const companies = Array.from(new Set(brands.map(b => b.company))).sort();
  const forms = Array.from(new Set(brands.map(b => b.dosageForm))).sort();

  return (
    <main className="container-medq py-10">
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {genericName} <span className="text-gray-400 font-normal">Brand Names</span>
        </h1>
        <p className="text-gray-600">Showing all {brands.length} available brands for this generic in Bangladesh.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <Card className="shadow-none border-gray-200 sticky top-24">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-bold mb-3">Filter by Company</h3>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <option value="">All Companies</option>
                  {companies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <h3 className="font-bold mb-3">Dosage Form</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {forms.map(f => (
                    <label key={f} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                      <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                      {f}
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Brand List */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brands.map((brand) => (
              <DrugCard key={brand.slug} drug={brand} />
            ))}
          </div>
          
          {brands.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No brands found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
