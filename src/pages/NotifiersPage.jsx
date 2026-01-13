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

  useEffect(() => {
    setAddDisabled(notifiers.length === TOTAL_NOTIFIERS_NO);
  }, [notifiers]);

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
    } catch (error) {
      toast.error(`Failed to get notifier data: ${error.message}`);
    }
  };

  const removeNotifier = (id) => setNotifiers((prev) => prev.filter((n) => n.id !== id));

  const getCards = () => {
    if (notifiers.length === 0) {
      return <EmptyCards whatToAdd={"notifier"} showFooter={false} />;
    }
    return notifiers.map((notifier, index) => {
      return (
        <NotifierCard
          key={`${index}${notifier.id}_${notifier.type}`}
          data={notifier}
          options={NotifierCatalog.getSupportedNotifiers()
            .keys()
            .map((notifier) => ({ text: notifier, value: notifier }))}
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
