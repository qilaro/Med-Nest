export async function GET() {
  return new Response(
    `User-agent: *
Allow: /
Sitemap: https://mednest.com.bd/sitemap.xml`,
    { headers: { 'Content-Type': 'text/plain' } }
  );
}
