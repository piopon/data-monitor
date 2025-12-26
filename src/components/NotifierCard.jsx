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
    return <Select options={typeOptions} disabled={false} setter={notifierTypeSetter} value={notifierType} />;
  };

  const createUI = () => {
    const typeSelector = createTypeSelector();
    if ("" === notifierType) {
      return typeSelector;
    }
    return (
      <>
        {typeSelector}
        <div className="notifier-card-items">setting</div>
      </>
    );
  };

  return <div className="notifier-card">{createUI()}</div>;
};

export default NotifierCard;
