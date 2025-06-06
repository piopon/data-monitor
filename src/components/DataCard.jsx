import DataItem from "@/components/DataItem";

const DataCard = ({ data }) => {
  return (
    <div className="data-card">
      <h3 className="data-card-title">
        {data.category} {data.name}
      </h3>
      <div className="data-card-items">
        {data.items.map((element) => (
          <DataItem key={element.name} item={element} />
        ))}
      </div>
    </div>
  );
};

export default DataCard;
