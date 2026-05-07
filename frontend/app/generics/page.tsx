import React from 'react';
import Link from 'next/link';
import AZBrowse from '@/components/drugs/AZBrowse';
import { Pagination } from '@/components/ui/pagination';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

const ITEMS_PER_PAGE = 24;

async function getGenerics(page: number = 1, searchQuery?: string) {
  const offset = (page - 1) * ITEMS_PER_PAGE;
  
  const searchCondition = searchQuery ? `%${searchQuery}%` : '%';

  const [data, totalResult] = await Promise.all([
    db.execute(sql`
      SELECT DISTINCT g.id, g.name, g.therapeutic_class as class, 
             (SELECT COUNT(*) FROM brands b2 WHERE b2.generic_id = g.id) as brand_count
      FROM generics g
      LEFT JOIN brands b ON g.id = b.generic_id
      WHERE g.name ILIKE ${searchCondition} OR b.brand_name ILIKE ${searchCondition}
      ORDER BY g.name ASC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `),
    db.execute(sql`
      SELECT COUNT(DISTINCT g.id) as total 
      FROM generics g
      LEFT JOIN brands b ON g.id = b.generic_id
      WHERE g.name ILIKE ${searchCondition} OR b.brand_name ILIKE ${searchCondition}
    `)
  ]);

  const total = Number(totalResult.rows[0].total);
  return { list: data.rows, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
}

export default async function GenericsPage(props: { searchParams: Promise<{ page?: string, q?: string }> }) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || '1');
  const query = searchParams.q || '';
  const { list: genericList, totalPages } = await getGenerics(page, query);

  return (
    <div className="min-h-screen bg-[#f9f9f9] py-10">
      <div className="container-medq max-w-[950px] mx-auto bg-white p-8 rounded-3xl shadow-[50px_0_80px_-20px_rgba(0,0,0,0.15),_0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Allopathic Generics</h1>
          <p className="text-muted-foreground">Browse our complete database of ingredients, verified by pharmacists.</p>
        </header>

        <form className="flex flex-wrap gap-4 mb-10 items-center" action="/generics" method="GET">
          <div className="relative flex-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
            <input name="q" defaultValue={query} type="text" className="w-full border border-gray-200 bg-transparent px-10 py-4 h-14 rounded-xl text-base shadow-sm outline-none focus:border-primary" placeholder="Search generics or brands..." />
          </div>
          <button className="inline-flex items-center justify-center py-2 h-14 px-8 rounded-xl font-bold bg-primary text-white hover:bg-primary-dark transition-colors cursor-pointer" type="submit">
            Find
          </button>
        </form>

        <div className="flex justify-center mb-10">
          <AZBrowse />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {genericList.map((g: any) => (
            <div key={g.name} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all flex items-center justify-between">
              <div className="min-w-0">
                <Link href={`/generics/${g.name.toLowerCase().replace(/ /g, '-')}`} className="text-sm font-bold text-navy hover:text-primary transition-colors block truncate">
                  {g.name}
                </Link>
                <div className="flex gap-4 mt-1 text-[11px] text-gray-500">
                  <span className="truncate">{g.class || 'Uncategorized'}</span>
                  <span>•</span>
                  <span>{g.brand_count} Brands</span>
                </div>
              </div>
              
              <Link 
                href={`/drugs?generic=${encodeURIComponent(g.name)}`} 
                className="px-4 py-1.5 bg-primary text-white text-[11px] font-bold rounded-full hover:bg-primary-dark transition-colors shrink-0"
              >
                View
              </Link>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} />
        )}
      </div>
    </div>
  );
}
