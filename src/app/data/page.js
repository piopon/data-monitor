"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import UserAccess from "@/components/UserAccess";
import Spinner from "@/components/Spinner";
import DataCards from "@/components/DataCards";

export default function Data() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch("/api/data", {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
  }, []);

  return (
    <UserAccess>
      <section id="data-section">{loading ? <Spinner /> : <DataCards data={data} />}</section>;
    </UserAccess>
  );
}
