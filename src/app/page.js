import { toast } from "react-toastify";
import HomePage from "@/pages/HomePage";
import GuestAccess from "@/components/GuestAccess";

export default async function Home() {
  const serverAddress = `http://${process.env.SERVER_URL}:${process.env.SERVER_PORT}`;
  const response = await fetch(`${serverAddress}/api/init`);
  if (!response.ok) {
    const err = await response.json();
    toast.error(err.message);
    return;
  }
  const currentFeatures = await response.json();

  return (
    <GuestAccess>
      <HomePage demo={!currentFeatures.demo} />
    </GuestAccess>
  );
}
