import { useState } from "react";
import { NotifierCatalog } from "@/notifiers/core/NotifierCatalog";
import Select from "@/widgets/Select";

const NotifierCard = ({ data }) => {
  const [notifierType, setNotifierType] = useState(data.type);

  const notifierCardElement = (name, element) => {
    return (
      <div className={"notifier-card-" + { name }}>
        <p className="card-label">{name}</p>
        {element}
      </div>
    );
  };

  const notifierTypeSetter = (selection) => setNotifierType(selection.value);

  const createTypeSelector = () => {
    const typeSelect = (
      <Select
        options={NotifierCatalog.getSupportedNotifiers()
          .keys()
          .map((notifier) => ({ text: notifier, value: notifier }))}
        disabled={false}
        setter={notifierTypeSetter}
        value={notifierType}
      />
    );
    return notifierCardElement("type", typeSelect);
  };

  const createSettings = () => {
    return (
      <>
        {notifierCardElement("origin", <input name="notifierOrigin" />)}
        {notifierCardElement("sender", <input name="notifierSender" />)}
        {notifierCardElement("password", <input name="notifierPass" />)}
      </>
    );
  };

  const createCardItems = () => {
    const typeSelector = createTypeSelector();
    if ("" === notifierType) {
      return typeSelector;
    }
    return (
      <div className="notifier-card-items">
        {typeSelector}
        {createSettings()}
      </div>
    );
  };

  return <div className="notifier-card">{createCardItems()}</div>;
};

export default NotifierCard;
