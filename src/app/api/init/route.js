import { MonitorService } from "@/model/MonitorService";

export async function GET(request) {
  await MonitorService.initializeDbTable();
  return new Response("DB init invoked");
}
