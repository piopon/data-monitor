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
      <div className="notifier-cards-div">
        {notifiers.length === 0 ? (
          <EmptyCards whatToAdd={"notifier"} showFooter={false} />
        ) : (
          notifiers.map((notifier, index) => {
            return <NotifierCard key={`${index}_${notifier.type}`} data={notifier} />;
          })
        )}
      </div>
      <button className="add-notifier" onClick={addNotifier}>
        add
      </button>
    </section>
  );
};

export default NotifiersPage;
