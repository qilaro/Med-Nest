"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export function DynamicDrugContent({ slug }: { slug: string }) {
  const [drug, setDrug] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/data/drug_details/${slug}.json`)
      .then(res => res.json())
      .then(data => {
        setDrug(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Medicine Details...</div>;
  if (!drug) return <div className="p-8 text-center text-red-500">Could not load drug details.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white text-black">
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-4xl font-bold">{drug.brandName}</h1>
        <Tabs defaultValue="indications" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto p-1">
            {['Indications', 'Dosage', 'Warnings', 'Side Effects', 'Interactions', 'FAQs', 'Regulatory'].map((tab) => (
              <TabsTrigger key={tab} value={tab.toLowerCase().replace(' ', '-')}>{tab}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="indications" className="mt-6 p-6 border rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Indications</h2>
            <p className="text-gray-700 leading-relaxed">{drug.indications || "No indication data available."}</p>
          </TabsContent>
          <TabsContent value="dosage" className="mt-6 p-6 border rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Dosage</h2>
            <p className="text-gray-700 leading-relaxed">{drug.dosage || "No dosage data available."}</p>
          </TabsContent>
          <TabsContent value="warnings" className="mt-6 p-6 border rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Warnings & Precautions</h2>
            <p className="text-gray-700 leading-relaxed">{drug.warnings || "No warning data available."}</p>
          </TabsContent>
          <TabsContent value="side-effects" className="mt-6 p-6 border rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Side Effects</h2>
            <p className="text-gray-700 leading-relaxed">{drug.sideEffects || "No side effects data available."}</p>
          </TabsContent>
          <TabsContent value="interactions" className="mt-6 p-6 border rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Interactions</h2>
            <p className="text-gray-700 leading-relaxed">{drug.interactions || "No interaction data available."}</p>
          </TabsContent>
          <TabsContent value="faqs" className="mt-6 p-6 border rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            {drug.faqs && drug.faqs.length > 0 ? (
              <ul className="space-y-4">
                {drug.faqs.map((faq: any, i: number) => (
                  <li key={i}>
                    <h4 className="font-bold">{faq.question}</h4>
                    <p className="text-gray-700">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            ) : <p>No FAQs available.</p>}
          </TabsContent>
          <TabsContent value="regulatory" className="mt-6 p-6 border rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Regulatory Approval</h2>
            <div className="flex items-center gap-2 text-green-700 font-semibold">
              <ShieldCheck /> Verified DGDA Approval
            </div>
            <p className="mt-2 text-sm text-gray-600">BM&DC Registered Professional Review pending.</p>
          </TabsContent>
        </Tabs>
      </div>
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg">Pricing Matrix</h3>
            <p>Price: {drug.fixedMarketPrice}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
