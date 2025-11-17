import { toast } from "react-toastify";
import HomePage from "@/pages/HomePage";

export default async function Home() {
  const response = await fetch("/api/init");
  if (!response.ok) {
    const err = await response.json();
    toast.error(err.message);
    return;
  }
  const currentFeatures = await response.json();

  return <HomePage demo={currentFeatures.demo} />;
}
