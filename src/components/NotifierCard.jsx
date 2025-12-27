import { useState } from "react";
import { NotifierCatalog } from "@/notifiers/core/NotifierCatalog";
import Select from "@/widgets/Select";

const NotifierCard = ({ data }) => {
  const [notifierType, setNotifierType] = useState(data.type);

  const notifierCardElement = (name, element) => {
    return (
      <div className={"notifier-card-" + {name}}>
        <p className="card-label">{name}</p>
        {element}
      </div>
    );
  };

  const notifierTypeSetter = (selection) => setNotifierType(selection.value);

  const createTypeSelector = () => {
    const typeOptions = NotifierCatalog.getSupportedNotifiers()
      .keys()
      .map((notifier) => ({ text: notifier, value: notifier }));
    return notifierCardElement(
      "type",
      <Select options={typeOptions} disabled={false} setter={notifierTypeSetter} value={notifierType} />
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
