import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generics } from '@/lib/db/schema';
import { sql, ilike } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const results = await db.select({
      name: generics.name,
    })
    .from(generics)
    .where(ilike(generics.name, `%${query}%`))
    .limit(10);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
