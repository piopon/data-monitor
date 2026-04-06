export default async function waitOn(options = {}) {
  const resources = Array.isArray(options.resources) ? options.resources.join(",") : "";
  console.log(`wait-on ok: ${resources}`);
}
