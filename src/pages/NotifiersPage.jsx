import { NotifierCatalog } from "@/notifiers/core/NotifierCatalog";

const NotifiersPage = () => {
  return (
    <section id="notifiers-section">
      {NotifierCatalog.getSupportedNotifiers()
        .keys()
        .map((type) => (
          <div>{type}</div>
        ))}
    </section>
  );
};

export default NotifiersPage;
