import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const SWAGGER_UI_CSS_PATH = path.join(process.cwd(), "node_modules", "swagger-ui-dist", "swagger-ui.css");

export async function GET() {
  try {
    const css = await fs.readFile(SWAGGER_UI_CSS_PATH, "utf8");
    return new Response(css, {
      status: 200,
      headers: {
        "Content-Type": "text/css; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    return new Response(`/* Cannot load Swagger UI CSS: ${error.message} */`, {
      status: 500,
      headers: { "Content-Type": "text/css; charset=utf-8" },
    });
  }
}
