import { getAppVersion } from "@/lib/AppVersion";

/**
 * Basic liveness endpoint for container and external health probes.
 */
export async function GET() {
  const now = new Date().toISOString();
  const body = {
    status: "ok",
    service: "data-monitor",
    timestamp: now,
    uptimeSeconds: Math.floor(process.uptime()),
    version: getAppVersion(),
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
