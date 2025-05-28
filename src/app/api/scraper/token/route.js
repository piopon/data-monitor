export async function POST(req) {
  const scraperUrl = `http://${process.env.SCRAPER_IP || "127.0.0.1"}:${process.env.SCRAPER_PORT || 5000}`;
  const body = await req.json();
  const response = await fetch(`${scraperUrl}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
