import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import Spinner from "../components/Spinner";
import DataCard from "../components/DataCard";

const DataPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch("/scraper/api/v1/data", {
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
    <section id="data-section">
      <div>
        {loading ? (
          <Spinner />
        ) : (
          data.map((item) => <DataCard data={item}/>)
        )}
      </div>
    </section>
  );
};

export default DataPage;
