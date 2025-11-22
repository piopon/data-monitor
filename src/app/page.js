import HomePage from "@/pages/HomePage";
import GuestAccess from "@/components/GuestAccess";

export default async function Home() {
  const serverAddress = `http://${process.env.SERVER_URL}:${process.env.SERVER_PORT}`;
  const response = await fetch(`${serverAddress}/api/init`);
  const data = await response.json();

  return (
    <GuestAccess>
      <HomePage demoEnabled={data.demo} initError={!data.init ? data.message : undefined} />
    </GuestAccess>
  );
}
