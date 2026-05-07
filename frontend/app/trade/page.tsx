import React from 'react';
import Link from 'next/link';
import AZBrowse from '@/components/drugs/AZBrowse';
import DrugCard from '@/components/drugs/DrugCard';
import { Pagination } from '@/components/ui/pagination';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { DrugSummary } from '@/types/drug';

const ITEMS_PER_PAGE = 24;

async function getTradeBrands(page: number = 1, searchQuery?: string) {
  const offset = (page - 1) * ITEMS_PER_PAGE;
  
  const searchCondition = searchQuery ? `%${searchQuery}%` : '%';

  const [data, totalResult] = await Promise.all([
    db.execute(sql`
      SELECT 
        b.id,
        b.brand_name as "brandName",
        b.generic_name as "genericName",
        b.company_name as "company",
        b.slug,
        b.price_unit as "price",
        b.dosage_form as "dosageForm",
        b.therapeutic_class as "drugClass",
        b.average_rating as "averageRating"
      FROM brands b
      WHERE b.brand_name ILIKE ${searchCondition} OR b.generic_name ILIKE ${searchCondition}
      ORDER BY b.brand_name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `),
    db.execute(sql`
      SELECT COUNT(*) as total 
      FROM brands b
      WHERE b.brand_name ILIKE ${searchCondition} OR b.generic_name ILIKE ${searchCondition}
    `)
  ]);

  const total = Number(totalResult.rows[0].total);
  const formattedList = data.rows.map((row: any) => ({
    ...row,
    averageRating: row.averageRating ? Number(row.averageRating) : 0,
    price: row.price ? `৳ ${row.price}` : "N/A"
  }));
  return { list: formattedList as DrugSummary[], totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
}

export default async function TradePage(props: { searchParams: Promise<{ page?: string, q?: string }> }) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || '1');
  const query = searchParams.q || '';
  const { list: brandList, totalPages } = await getTradeBrands(page, query);

  return (
    <div className="container-medq py-10">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Trade Brands</h1>
          <p className="text-muted-foreground">Browse our complete database of brand names with detailed medication information.</p>
        </header>

        <form className="flex flex-wrap gap-4 mb-10 items-center" action="/trade" method="GET">
          <div className="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
            <input name="q" defaultValue={query} type="text" className="w-full border border-gray-200 bg-transparent px-10 py-4 h-14 rounded-xl text-base shadow-sm outline-none focus:border-primary" placeholder="Search brands or generics..." />
          </div>
          <button className="inline-flex items-center justify-center py-2 h-14 px-8 rounded-xl font-bold bg-primary text-white hover:bg-primary-dark transition-colors cursor-pointer" type="submit">
            Find
          </button>
        </form>

        <div className="flex justify-center mb-10">
          <AZBrowse />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {brandList.map((drug) => (
            <DrugCard key={drug.slug} drug={drug} />
          ))}
        </div>

        {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} />
        )}
      </div>
    </div>
  );
}
