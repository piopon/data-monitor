import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const SWAGGER_UI_PRESET_PATH = path.join(
  process.cwd(),
  "node_modules",
  "swagger-ui-dist",
  "swagger-ui-standalone-preset.js"
);

export async function GET() {
  try {
    const script = await fs.readFile(SWAGGER_UI_PRESET_PATH, "utf8");
    return new Response(script, {
      status: 200,
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    return new Response(`console.error(${JSON.stringify("Cannot load Swagger UI preset")});`, {
      status: 500,
      headers: { "Content-Type": "application/javascript; charset=utf-8" },
    });
  }
}
