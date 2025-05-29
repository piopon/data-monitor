export async function GET(req) {
  const scraperUrl = `http://${process.env.SCRAPER_IP || "127.0.0.1"}:${process.env.SCRAPER_PORT || 5000}`;
  const response = await fetch(`${scraperUrl}/api/v1/data`, {
    method: "GET",
    headers: { Authorization: req.headers.get("authorization") || "" },
  });
  return new Response(JSON.stringify(await response.json()), {
    status: response.status,
    headers: response.headers,
  });
}
