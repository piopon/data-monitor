import { useState } from "react";
import { NotifierCatalog } from "@/notifiers/core/NotifierCatalog";
import Select from "@/widgets/Select";

const NotifierCard = ({ data }) => {
  const [notifierType, setNotifierType] = useState(data.type);

  const notifierTypeSetter = (selection) => setNotifierType(selection.value);

  const createTypeSelector = () => {
    const typeOptions = NotifierCatalog.getSupportedNotifiers()
      .keys()
      .map((notifier) => ({ text: notifier, value: notifier }));
    return (
      <div className="notifier-card-type">
        <p className="card-label">type</p>
        <Select options={typeOptions} disabled={false} setter={notifierTypeSetter} value={notifierType} />
      </div>
    );
  };

  const createCardItems = () => {
    const typeSelector = createTypeSelector();
    if ("" === notifierType) {
      return typeSelector;
    }
    return <div className="notifier-card-items">{typeSelector}setting</div>;
  };

  return <div className="notifier-card">{createCardItems()}</div>;
};

export default NotifierCard;
