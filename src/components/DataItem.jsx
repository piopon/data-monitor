import unknown from "@/assets/images/unknown.png";

const DataItem = ({ item }) => {
  const valid = "OK" === item.status;
  const state = valid ? `✔️` : `❌`;
  const image = valid ? { src: item.icon, alt: `${item.name} logo` } : { src: unknown, alt: `Unknown logo` };
  const value = valid
    ? { data: `${item.price} ${item.currency}`, threshold: `THRESHOLD SETTINGS...` }
    : { data: item.reason, threshold: `FIX ITEM CONFIG...` };

  return (
    <div className="data-card-item">
      <img src={image.src} alt={image.alt} />
      <div>
        <p>
          {state}
          <span>{item.name}</span>: {value.data}
        </p>
        <div>{value.threshold}</div>
      </div>
    </div>
  );
};

export default DataItem;
