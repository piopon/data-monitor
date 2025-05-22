import { useEffect } from "react";

const DataPage = () => {
  useEffect(() => {
    const getData = async () => {
      const response = await fetch("/scraper/api/v1/data", {
        method: "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      console.log(data)
    };
    getData();
  }, []);

  return (
    <section id="data-section">
      <p>DataPage</p>
    </section>
  );
};

export default DataPage;
