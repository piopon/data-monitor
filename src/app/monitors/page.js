"use client";

import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LoginContext, PageContext } from "@/context/Contexts";
import UserAccess from "@/components/UserAccess";
import MonitorsPage from "@/views/MonitorsPage";
import { RequestUtils } from "@/lib/RequestUtils";

export default function Monitors() {
  const MAX_ATTEMPTS = 5;
  const WAIT_TIME_MS = 500;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDemo, token } = useContext(LoginContext);
  const { setPageId } = useContext(PageContext);

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
            const message = await RequestUtils.getResponseMessage(response);
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
    setPageId("monitors");
  }, [isDemo, setPageId, token]);

  return (
    <UserAccess>
      <MonitorsPage loading={loading} data={data} />
    </UserAccess>
  );
}
