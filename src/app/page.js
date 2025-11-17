import { toast } from "react-toastify";
import HomePage from "@/pages/HomePage";
import GuestAccess from "@/components/GuestAccess";

export default async function Home() {
  const response = await fetch("/api/init");
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
