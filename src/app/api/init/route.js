import { MonitorService } from "@/model/MonitorService";

export async function GET(request) {
  const monitorInitResult = await MonitorService.initializeDbTable();
  return new Response(monitorInitResult, {
    status: monitorInitResult.result ? 200 : 500,
    headers: { "Content-Type": "application/json" },
  });
}
