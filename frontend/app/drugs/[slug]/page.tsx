import { Suspense } from "react";
import { getDrugDetailServer } from "@/lib/services/drugService.server";
import { Metadata } from "next";
import { DynamicDrugContent } from "@/components/drugs/DynamicDrugContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const drug = await getDrugDetailServer(slug);
    return {
      title: `${drug.brandName} - Price of Medicine in Bangladesh | ${drug.strength}`,
      description: `Check the fixed market price and details for ${drug.brandName} (${drug.genericName}) medicine. Reliable information on dosage, uses, and availability in Bangladesh.`,
    };
  } catch {
    return { title: "Medicine Not Found" };
  }
}

export default async function DrugDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <main className="container-medq py-8">
      {/* Static Shell / Loading State */}
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Medicine Details...</div>}>
        <DynamicDrugContent slug={slug} />
      </Suspense>
    </main>
  );
}
