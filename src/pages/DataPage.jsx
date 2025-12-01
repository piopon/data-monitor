import DataCards from "@/components/DataCards";
import EmptyCards from "@/components/EmptyCards";
import Spinner from "@/components/Spinner";

const DataPage = ({ loading, data }) => {
  return (
    <section id="data-section">
      {loading ? <Spinner /> : data.length > 0 ? <DataCards data={data} /> : <EmptyCards />}
    </section>
  );
};

export default DataPage;
