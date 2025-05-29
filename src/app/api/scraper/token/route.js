export async function POST(req) {
  const scraperUrl = `http://${process.env.SCRAPER_IP || "127.0.0.1"}:${process.env.SCRAPER_PORT || 5000}`;
  const response = await fetch(`${scraperUrl}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await req.json()),
  });
  return new Response(JSON.stringify(await response.json()), {
    status: response.status,
    headers: response.headers,
  });
}
