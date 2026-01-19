import DataCards from "@/components/DataCards";
import EmptyCards from "@/components/EmptyCards";
import Spinner from "@/widgets/Spinner";

const MonitorsPage = ({ loading, data }) => {
  return (
    <section id="data-section">
      {loading ? <Spinner /> : data.length > 0 ? <DataCards data={data} /> : <EmptyCards whatToAdd={"monitor"} />}
    </section>
  );
};

export default MonitorsPage;
