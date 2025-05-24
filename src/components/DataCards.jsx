import DataCard from "./DataCard";

const DataCards = ({ data }) => {
  return (
    <div className="data-cards-div">
      {data.map((item) => (
        <DataCard data={item} />
      ))}
    </div>
  );
};

export default DataCards;
