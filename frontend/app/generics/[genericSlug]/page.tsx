import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { sql, ilike } from "drizzle-orm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Speaker } from "lucide-react";
import React from 'react';

interface PageProps {
  params: Promise<{ genericSlug: string }>;
}

interface GenericDetail {
  id: string;
  name: string;
  therapeuticClass: string | null;
  indications: string | null;
  sideEffects: string | null;
  interactions: string | null;
  contraindications: string | null;
  pregnancyLactation: string | null;
  precautions: string | null;
  dosage: string | null;
  storageConditions: string | null;
  overdoseEffects: string | null;
  specialPopulations: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

async function getGenericDetail(slug: string): Promise<GenericDetail | null> {
  const decodedName = decodeURIComponent(slug).replace(/-/g, " ");

  const exact = await db.execute(sql`
    SELECT
      id,
      name,
      therapeutic_class AS "therapeuticClass",
      indications,
      side_effects AS "sideEffects",
      interactions,
      contraindications,
      pregnancy_lactation AS "pregnancyLactation",
      precautions,
      dosage,
      storage_conditions AS "storageConditions",
      overdose_effects AS "overdoseEffects",
      special_populations AS "specialPopulations",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM generics
    WHERE LOWER(name) = ${decodedName.toLowerCase()}
    LIMIT 1
  `);

  if (exact.rows[0]) return exact.rows[0] as unknown as GenericDetail;

  const partial = await db.execute(sql`
    SELECT
      id,
      name,
      therapeutic_class AS "therapeuticClass",
      indications,
      side_effects AS "sideEffects",
      interactions,
      contraindications,
      pregnancy_lactation AS "pregnancyLactation",
      precautions,
      dosage,
      storage_conditions AS "storageConditions",
      overdose_effects AS "overdoseEffects",
      special_populations AS "specialPopulations",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM generics
    WHERE name ILIKE ${`%${decodedName}%`}
    LIMIT 1
  `);

  return (partial.rows[0] || null) as unknown as GenericDetail | null;
}

export default async function GenericDetailPage({ params }: PageProps) {
  const { genericSlug } = await params;
  const generic = await getGenericDetail(genericSlug);

  if (!generic) notFound();

  return (
    <main className="container-medq py-6">
      {/* Header */}
      <section className="mb-8 border-b border-gray-100 pb-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-6">
            <div className="flex flex-1 items-start gap-10">
              <div className="flex-initial">
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <h1 className="text-4xl font-extrabold text-navy tracking-tight">{generic.name}</h1>
                    <button className="text-gray-300 hover:text-primary transition-colors p-1.5"><Speaker size={20} /></button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-semibold text-[#2D8A7D]">{generic.therapeuticClass || 'Allopathic Generic'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container-medq grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-12">
          <Tabs defaultValue="indications" className="w-full">
            <TabsList className="grid grid-cols-4 md:grid-cols-4 h-14 bg-white p-1.5 border border-gray-100 rounded-2xl shadow-sm mb-8">
              {[
                {id: 'indications', label: 'Indications'}, 
                {id: 'dosage', label: 'Dosage'}, 
                {id: 'side-effects', label: 'Side Effects'}, 
                {id: 'interactions', label: 'Interactions'}, 
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
            
            <TabsContent value="indications" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="prose prose-slate max-w-none bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black mb-4 text-navy">Indications</h2>
                <p className="text-gray-700 leading-relaxed text-sm font-medium">{generic.indications || 'Information not available.'}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="dosage" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="prose prose-slate max-w-none bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black mb-4 text-navy">Dosage</h2>
                <p className="text-gray-700 leading-relaxed text-sm font-medium">{generic.dosage || 'Information not available.'}</p>
              </div>
            </TabsContent>

            <TabsContent value="side-effects" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="prose prose-slate max-w-none bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black mb-4 text-navy">Side Effects</h2>
                <p className="text-gray-700 leading-relaxed text-sm font-medium">{generic.sideEffects || 'Information not available.'}</p>
              </div>
            </TabsContent>

            <TabsContent value="interactions" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="prose prose-slate max-w-none bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black mb-4 text-navy">Interactions</h2>
                <p className="text-gray-700 leading-relaxed text-sm font-medium">{generic.interactions || 'Information not available.'}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="max-w-[320px] space-y-3">
          <Card className="shadow-lg border-none bg-navy text-white rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <h3 className="font-black text-sm mb-4 uppercase tracking-widest text-mint opacity-80">Generic Profile</h3>
              <div className="space-y-4">
                 <div className="text-sm"><p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">Class</p><p className="font-medium text-white">{generic.therapeuticClass || 'Uncategorized'}</p></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
