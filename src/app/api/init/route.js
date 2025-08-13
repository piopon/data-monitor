import { MonitorService } from "@/model/MonitorService";
import { UserService } from "@/model/UserService";

export async function GET(request) {
  const monitorInitResult = await MonitorService.initializeTable();
  if (!monitorInitResult.result) {
    return new Response(JSON.stringify(monitorInitResult.message), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const userInitResult = await UserService.initializeTable();
  if (!userInitResult.result) {
    return new Response(JSON.stringify(userInitResult.message), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify("Database initialized correctly."), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
