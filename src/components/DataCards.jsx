import DataCard from "@/components/DataCard";

const DataCards = ({ data }) => {
  return (
    <div className="data-cards-div">
      {data.length > 0 ? data.map((item) => <DataCard key={item.name} data={item} />) : <div>NO CARDS PRESENT</div>}
    </div>
  );
};

export default DataCards;
