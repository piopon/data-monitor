import { useState } from "react";
import { NotifierCatalog } from "@/notifiers/core/NotifierCatalog";
import Select from "@/widgets/Select";

const NotifierCard = ({ data }) => {
  const [notifierType, setNotifierType] = useState(data.type);
  const [notifierPass, setNotifierPass] = useState(data.password);
  const [notifierOrigin, setNotifierOrigin] = useState(data.origin);
  const [notifierSender, setNotifierSender] = useState(data.sender);

  const saveNotifier = async (event) => {
    event.preventDefault();
    const notifier = { type: notifierType, origin: notifierOrigin, sender: notifierSender, password: notifierPass };
    try {
      const notifierResponse = await fetch(`/api/notifier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifier),
      });
      const notifierData = await notifierResponse.json();
      if (!notifierResponse.ok) {
        toast.error(notifierData.message);
        return;
      }
      toast.success(`Saved notifier!`);
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    }
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
        <button className="notifier-save-btn" type="submit">
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
