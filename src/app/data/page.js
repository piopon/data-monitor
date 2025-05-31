"use client";

import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import UserAccess from "@/components/UserAccess";
import Spinner from "@/components/Spinner";
import DataCards from "@/components/DataCards";
import { LoginContext } from "@/context/Contexts";

export default function Data() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(LoginContext);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch("/api/scraper/data", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const message = await response.text();
          toast.error(message);
          return;
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
  }, [token]);

  return (
    <UserAccess>
      <section id="data-section">{loading ? <Spinner /> : <DataCards data={data} />}</section>
    </UserAccess>
  );
}
