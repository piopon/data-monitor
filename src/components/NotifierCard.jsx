import { NotifierCatalog } from "@/notifiers/core/NotifierCatalog";
import Select from "@/widgets/Select";

const NotifierCard = ({ data }) => {
  const createEmpty = () => {
    return <Select options={NotifierCatalog.getSupportedNotifiers().keys()} disabled={false} />;
  };

  const createUI = () => {
    if (!data.type) {
      return createEmpty();
    }
    return <div className="notifier-card-items">setting</div>;
  }

  return (
    <div className="notifier-card">
      {createUI()}
    </div>
  );
};

export default NotifierCard;
