import NotifierCard from "@/components/NotifierCard";
import { NotifierCatalog } from "@/notifiers/core/NotifierCatalog";

const NotifiersPage = () => {
  return (
    <section id="notifiers-section">
      {NotifierCatalog.getSupportedNotifiers()
        .keys()
        .map((type) => (
          <NotifierCard key={type} type={type} />
        ))}
    </section>
  );
};

export default NotifiersPage;
