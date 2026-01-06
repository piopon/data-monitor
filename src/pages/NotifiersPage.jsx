import { useEffect, useState } from "react";
import NotifierCard from "@/components/NotifierCard";
import EmptyCards from "@/components/EmptyCards";

const NotifiersPage = () => {
  const [notifiers, setNotifiers] = useState([]);

  useEffect(() => {
    const initialize = async () => {
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
    initialize();
  }, []);

  const removeNotifier = (id) => {
    setNotifiers((prev) => prev.filter((n) => n.id !== id))
  };

  const getCards = () => {
    if (notifiers.length === 0) {
      return <EmptyCards whatToAdd={"notifier"} showFooter={false} />;
    }
    return notifiers.map((notifier, index) => {
      return <NotifierCard key={`${index}${notifier.id}_${notifier.type}`} data={notifier} onDelete={removeNotifier} />;
    });
  };

  const addNotifier = () => {
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
      <button className="add-notifier" onClick={addNotifier}>
        add
      </button>
    </section>
  );
};

export default NotifiersPage;
