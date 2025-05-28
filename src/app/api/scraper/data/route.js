export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  const response = await fetch("http://192.168.0.103:5000/api/v1/data", {
    method: "GET",
    headers: { Authorization: authHeader || "" },
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}
