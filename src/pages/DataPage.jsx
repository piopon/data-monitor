import { useState, useEffect } from "react";

const DataPage = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const response = await fetch("/scraper/api/v1/data", {
        method: "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      setData(data);
    };
    getData();
  }, []);

  return (
    <section id="data-section">
      <p>DataPage</p>
      <div>
        {data.map((item) => <p>{item.name} - {item.category} - {item.items.length} item(s)</p>)}
      </div>
    </section>
  );
};

export default DataPage;
