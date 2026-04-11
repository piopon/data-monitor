import path from "node:path";
import { OpenApiBundler } from "@/lib/OpenApiBundler";

export const runtime = "nodejs";

const OPENAPI_ROOT_PATH = path.join(process.cwd(), "openapi", "openapi.json");
let cachedOpenApiDocument = undefined;
let pendingBundlePromise = undefined;

async function getBundledOpenApiDocument() {
  if (process.env.NODE_ENV !== "production") {
    return OpenApiBundler.bundleFromFile(OPENAPI_ROOT_PATH);
  }
  if (cachedOpenApiDocument != null) {
    return cachedOpenApiDocument;
  }
  if (pendingBundlePromise != null) {
    return pendingBundlePromise;
  }

  pendingBundlePromise = OpenApiBundler.bundleFromFile(OPENAPI_ROOT_PATH)
    .then((document) => {
      cachedOpenApiDocument = document;
      return document;
    })
    .finally(() => {
      pendingBundlePromise = undefined;
    });

  return pendingBundlePromise;
}

export async function GET() {
  try {
    const openApiDocument = await getBundledOpenApiDocument();
    return new Response(JSON.stringify(openApiDocument, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const output = {
      message: `Cannot load OpenAPI specification: ${OpenApiBundler.getErrorMessage(error)}`,
    };
    return new Response(JSON.stringify(output), {
      status: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
}
