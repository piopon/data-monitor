import DataCard from "@/components/DataCard";

const DataCards = ({ data }) => {
  return (
    <div className="data-cards-div">
      {data.map((item) => (
        <DataCard key={item.name} data={item} />
      ))}
    </div>
  );
};

export default DataCards;
