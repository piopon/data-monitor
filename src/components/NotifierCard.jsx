import { useState } from "react";
import { NotifierCatalog } from "@/notifiers/core/NotifierCatalog";
import Select from "@/widgets/Select";

const NotifierCard = ({ data }) => {
  const [notifierType, setNotifierType] = useState(data.type);

  const createEmpty = () => {
    const typeOptions = NotifierCatalog.getSupportedNotifiers()
      .keys()
      .map((notifier) => ({ text: notifier, value: notifier }));
    return <Select options={typeOptions} disabled={false} />;
  };

  const createUI = () => {
    if (!notifierType) {
      return createEmpty();
    }
    return <div className="notifier-card-items">setting</div>;
  };

  return <div className="notifier-card">{createUI()}</div>;
};

export default NotifierCard;
