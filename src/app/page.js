import HomePage from "@/views/HomePage";
import GuestAccess from "@/components/GuestAccess";

export const dynamic = "force-dynamic";

export default async function Home() {
  const shouldInitOnStart = ["1", "true", "yes", "on"].includes(
    String(process.env.INIT_ON_START || "false").toLowerCase(),
  );
  const serverHost = process.env.SERVER_URL || "127.0.0.1";
  const serverPort = process.env.SERVER_PORT || process.env.PORT || "3000";

  let data = { demo: false, init: true, message: "" };
  if (shouldInitOnStart) {
    try {
      const response = await fetch(`http://${serverHost}:${serverPort}/api/init`, { cache: "no-store" });
      const responseData = await response.json();
      data = {
        demo: Boolean(responseData?.demo),
        init: Boolean(responseData?.init),
        message: responseData?.message || "Initialization failed.",
      };
    } catch {
      data = { demo: false, init: false, message: "Cannot reach initialization endpoint." };
    }
  }

  return (
    <GuestAccess>
      <HomePage demoEnabled={data.demo} initError={!data.init ? data.message : undefined} />
    </GuestAccess>
  );
}
