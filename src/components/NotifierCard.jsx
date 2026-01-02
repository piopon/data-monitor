import { useState } from "react";
import { NotifierCatalog } from "@/notifiers/core/NotifierCatalog";
import Select from "@/widgets/Select";

const NotifierCard = ({ data }) => {
  const [notifierType, setNotifierType] = useState(data.type);

  const saveNotifier = async (event) => {
    event.preventDefault();
    console.log("SAVE NOTIFIER!!!");
  };

  const notifierCardElement = (name, element) => {
    return (
      <div className={"notifier-card-" + name}>
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

  const createSettings = (type) => {
    const labelOrigin = "email" === type ? "provider name" : "webhook";
    const labelSender = "email" === type ? "sender email" : "bot name";
    const labelPassword = "email" === type ? "sender password" : "-";
    return "email" === type ? (
      <>
        {notifierCardElement(labelOrigin, <input name="notifier-origin" className="notifier-origin" />)}
        {notifierCardElement(labelSender, <input name="notifier-sender" className="notifier-sender" />)}
        {notifierCardElement(labelPassword, <input type="password" name="notifier-pass" className="notifier-pass" />)}
      </>
    ) : (
      <>
        {notifierCardElement(labelSender, <input name="notifier-sender" className="notifier-sender" />)}
        {notifierCardElement(labelOrigin, <input name="notifier-origin" className="notifier-origin" />)}
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
        {createSettings(notifierType)}
        <button className="save-monitor" type="submit">
          save
        </button>
      </div>
    );
  };

  return (
    <div className="notifier-card">
      <form onSubmit={saveNotifier}>{createCardItems()}</form>
    </div>
  );
};

export default NotifierCard;
