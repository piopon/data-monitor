import { useState } from "react";
import NotifierCard from "@/components/NotifierCard";

const NotifiersPage = () => {
  const [notifiers, setNotifiers] = useState([]);

  const addNotifier = () => {
    notifiers.push("test");
    setNotifiers(notifiers);
  };

  return (
    <section id="notifiers-section">
      <div className="notifier-cards-div">
        {notifiers.map((type) => <NotifierCard key={type} type={type} />)}
      </div>
      <button className="add-notifier" onClick={addNotifier}>
        add
      </button>
    </section>
  );
};

export default NotifiersPage;
