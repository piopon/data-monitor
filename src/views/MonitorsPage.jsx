import DataCards from "@/components/DataCards";
import EmptyCards from "@/components/EmptyCards";
import ScrollHintContainer from "@/components/ScrollHintContainer";
import Spinner from "@/widgets/Spinner";

const MonitorsPage = ({ loading, data }) => {
  return (
    <ScrollHintContainer id="data-section" hintText="More monitors below, scroll down" hideScrollbar={true}>
      {loading ? <Spinner /> : data.length > 0 ? <DataCards data={data} /> : <EmptyCards whatToAdd={"monitor"} />}
    </ScrollHintContainer>
  );
};

export default MonitorsPage;
