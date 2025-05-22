import { useState, useEffect } from "react";

const DataPage = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch("/scraper/api/v1/data", {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error(`Failed to get data: ${error.message}`);
      }
    };
    getData();
  }, []);

  return (
    <section id="data-section">
      <div>
        {data.map((item) => <p>{item.name} - {item.category} - {item.items.length} item(s)</p>)}
      </div>
    </section>
  );
};

export default DataPage;
