import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generics } from '@/lib/db/schema';
import { ilike } from 'drizzle-orm';
import { genericSearchQuerySchema } from '@/lib/validators';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = genericSearchQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success || !parsed.data.q) {
    return NextResponse.json([]);
  }

  const query = parsed.data.q;

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
