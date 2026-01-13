import { useEffect, useState } from "react";
import NotifierCard from "@/components/NotifierCard";
import EmptyCards from "@/components/EmptyCards";
import { NotifierCatalog } from "@/notifiers/core/NotifierCatalog";

const NotifiersPage = () => {
  const TOTAL_NOTIFIERS_NO = NotifierCatalog.getSupportedNotifiers().size;
  const [notifiers, setNotifiers] = useState([]);
  const [addDisabled, setAddDisabled] = useState(false);

  useEffect(() => {
    refreshNotifiers();
  }, []);

  const refreshNotifiers = async () => {
    try {
      const notifiersResponse = await fetch(`/api/notifier`);
      const notifiersData = await notifiersResponse.json();
      if (!notifiersResponse.ok) {
        toast.error(notifiersData.message);
        return;
      }
      if (0 === notifiersData.length) {
        return;
      }
      setNotifiers(notifiersData);
      setAddDisabled(notifiersData.length === TOTAL_NOTIFIERS_NO);
    } catch (error) {
      toast.error(`Failed to get notifier data: ${error.message}`);
    }
  };

  const removeNotifier = (id) => {
    setNotifiers((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      setAddDisabled(updated.length === TOTAL_NOTIFIERS_NO);
      return updated;
    });
  };

  const getOptions = () => {
    const available = NotifierCatalog.getSupportedNotifiers().keys();
    const used = notifiers.map(notifier => notifier.type);
    return available.map((option) => ({ text: option, value: option, isDisabled: used.includes(option)}));
  };

  const getCards = () => {
    if (notifiers.length === 0) {
      return <EmptyCards whatToAdd={"notifier"} showFooter={false} />;
    }
    return notifiers.map((notifier, index) => {
      return (
        <NotifierCard
          key={`${index}${notifier.id}_${notifier.type}`}
          data={notifier}
          options={getOptions()}
          onChange={refreshNotifiers}
          onDelete={removeNotifier}
        />
      );
    });
  };

  const addNotifier = () => {
    setAddDisabled(true);
    setNotifiers((currentNotifiers) => [
      ...currentNotifiers,
      {
        type: "",
        origin: "",
        sender: "",
        password: "",
      },
    ]);
  };

  return (
    <section id="notifiers-section">
      <div className="notifier-cards-div">{getCards()}</div>
      <button className="add-notifier" onClick={addNotifier} disabled={addDisabled}>
        add
      </button>
    </section>
  );
};

export default NotifiersPage;
