import { MonitorService } from "@/model/MonitorService";

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter");
    const monitors = await MonitorService.getMonitors(filter ? filter : undefined);
    new Response(monitors, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot get monitors: ${error.message}` };
    new Response(errorOutput, {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request) {
  try {
    const monitorData = request.body;
    const monitor = await MonitorService.createClient(monitorData);
    new Response(monitor, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot add new monitor: ${error.message}` };
    new Response(errorOutput, {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const monitorData = request.body;
    const monitor = await MonitorService.editMonitor(id, monitorData);
    new Response(monitor, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot update monitor: ${error.message}` };
    new Response(errorOutput, {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const monitor = await MonitorService.deleteMonitor(id);
    new Response(monitor, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot delete monitor: ${error.message}` };
    new Response(errorOutput, {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
