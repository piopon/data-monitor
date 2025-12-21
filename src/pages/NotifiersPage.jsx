import NotifierCard from "@/components/NotifierCard";
import { NotifierCatalog } from "@/notifiers/core/NotifierCatalog";

const NotifiersPage = () => {
  const addNotifier = (event) => {
    console.log(event);
  };

  return (
    <section id="notifiers-section">
      <div className="notifier-cards-div">
        {NotifierCatalog.getSupportedNotifiers()
          .keys()
          .map((type) => (
            <NotifierCard key={type} type={type} />
          ))}
      </div>
      <button className="add-notifier" onClick={addNotifier}>
        add
      </button>
    </section>
  );
};

export default NotifiersPage;
