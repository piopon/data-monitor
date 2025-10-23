export async function POST(request) {
  const searchParams = request.nextUrl.searchParams;
  const notifierType = searchParams.get("type");
  return new Response(notifierType, { status: 200 });
}
