import DataCards from "@/components/DataCards";
import EmptyCards from "@/components/EmptyCards";
import Spinner from "@/components/Spinner";

const DataPage = ({ isLoading, data }) => {
  return (
    <section id="data-section">
      {isLoading ? <Spinner /> : data.length > 0 ? <DataCards data={data} /> : <EmptyCards />}
    </section>
  );
};

export default DataPage;
