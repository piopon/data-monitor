import { useState } from "react";
import NotifierCard from "@/components/NotifierCard";
import EmptyCards from "@/components/EmptyCards";

const NotifiersPage = () => {
  const [notifiers, setNotifiers] = useState([]);

  const addNotifier = () => {
    notifiers.push("test");
    setNotifiers(notifiers);
  };

  return (
    <section id="notifiers-section">
      <div className="notifier-cards-div">
        {notifiers.length === 0 ? (
          <EmptyCards whatToAdd={"notifier"} showFooter={false}/>
        ) : (
          notifiers.map((type) => <NotifierCard key={type} type={type} />)
        )}
      </div>
      <button className="add-notifier" onClick={addNotifier}>
        add
      </button>
    </section>
  );
};

export default NotifiersPage;
