export async function GET(req) {
  const scraperUrl = `http://${process.env.SCRAPER_IP || "127.0.0.1"}:${process.env.SCRAPER_PORT || 5000}`;
  const authHeader = req.headers.get("authorization");
  const response = await fetch(`${scraperUrl}/api/v1/data`, {
    method: "GET",
    headers: { Authorization: authHeader || "" },
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
