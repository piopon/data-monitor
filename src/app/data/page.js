"use client";

import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import UserAccess from "@/components/UserAccess";
import Spinner from "@/components/Spinner";
import DataCards from "@/components/DataCards";
import { LoginContext } from "@/context/Contexts";

export default function Data() {
  const MAX_ATTEMPTS = 5;
  const WAIT_TIME_MS = 500;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDemo, token } = useContext(LoginContext);

  useEffect(() => {
    const getData = async () => {
      if (!token) return;
      try {
        for (let attemptNo = 1; attemptNo < MAX_ATTEMPTS; attemptNo++) {
          var response = await fetch("/api/scraper/data", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            break;
          }
          if (isDemo && attemptNo <= MAX_ATTEMPTS) {
            toast.warn("Waiting for demo initialization...");
            await new Promise((res) => setTimeout(res, WAIT_TIME_MS));
          } else {
            const message = await response.text();
            toast.error(message);
            return;
          }
        }
        const data = await response.json();
        setData(data);
      } catch (error) {
        toast.error(`Failed to get data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [isDemo, token]);

  return (
    <UserAccess>
      <section id="data-section">{loading ? <Spinner /> : <DataCards data={data} />}</section>
    </UserAccess>
  );
}
