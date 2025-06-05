import { MonitorService } from "@/model/MonitorService";

export async function GET(request) {
  await new MonitorService().initializeDbTable();
  return new Response("DB init invoked");
}
