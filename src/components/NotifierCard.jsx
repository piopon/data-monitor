import { useState } from "react";
import { toast } from "react-toastify";
import { NotifierCatalog } from "@/notifiers/core/NotifierCatalog";
import Select from "@/widgets/Select";

const NotifierCard = ({ data, onDelete }) => {
  const [notifierType, setNotifierType] = useState(data.type);
  const [notifierPass, setNotifierPass] = useState(data.password);
  const [notifierOrigin, setNotifierOrigin] = useState(data.origin);
  const [notifierSender, setNotifierSender] = useState(data.sender);

  const saveNotifier = async () => {
    const notifier = { type: notifierType, origin: notifierOrigin, sender: notifierSender, password: notifierPass };
    try {
      const existing = data.id != null;
      const optionalIdParam = existing ? `?id=${data.id}` : "";
      const notifierResponse = await fetch(`/api/notifier${optionalIdParam}`, {
        method: existing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifier),
      });
      const notifierData = await notifierResponse.json();
      if (!notifierResponse.ok) {
        toast.error(notifierData.message);
        return;
      }
      toast.success(`${existing ? "Updated" : "Saved"} ${notifierType} notifier!`);
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    }
  };

  const deleteNotifier = async () => {
    try {
      if (data.id == null) {
        return;
      }
      const notifierResponse = await fetch(`/api/notifier?id=${data.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const notifierData = await notifierResponse.json();
      if (!notifierResponse.ok) {
        toast.error(notifierData.message);
        return;
      }
      onDelete(data.id)
      toast.success(`Deleted ${notifierType} notifier!`);
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
    return (
      <>
        {notifierCardElement(
          labelOrigin,
          <input
            type="text"
            name="notifier-origin"
            className="notifier-origin"
            value={notifierOrigin}
            onChange={(event) => setNotifierOrigin(event.target.value)}
          />
        )}
        {notifierCardElement(
          labelSender,
          <input
            type="text"
            name="notifier-sender"
            className="notifier-sender"
            value={notifierSender}
            onChange={(event) => setNotifierSender(event.target.value)}
          />
        )}
        {"email" === type &&
          notifierCardElement(
            labelPassword,
            <input
              type="password"
              name="notifier-pass"
              className="notifier-pass"
              value={notifierPass}
              onChange={(event) => setNotifierPass(event.target.value)}
            />
          )}
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
        {data.id && <button className="notifier-delete-btn" type="submit" formAction={deleteNotifier}>
          delete
        </button>}
      </div>
    );
  };

  return (
    <div className="notifier-card">
      <form action={saveNotifier}>{createCardItems()}</form>
    </div>
  );
};

export default NotifierCard;
