import DataCard from "@/components/DataCard";
import EmptyCards from "./EmptyCards";

const DataCards = ({ data }) => {
  return (
    <div className="data-cards-div">
      {data.length > 0 ? data.map((item) => <DataCard key={item.name} data={item} />) : <EmptyCards />}
    </div>
  );
};

export default DataCards;
