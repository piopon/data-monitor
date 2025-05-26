import unknown from "../assets/images/unknown.png";

const DataItem = ({ item }) => {
  const valid = "OK" === item.status;
  const state = valid ? `✔️` : `❌`;
  const image = valid ? {src: item.icon, alt: `${item.name} logo`} : {src: unknown, alt: `Unknown logo`};
  const detail = valid ? `${item.price} ${item.currency}` : item.reason;
  const config = valid ? `THRESHOLD SETTINGS...` : `FIX ITEM CONFIG...`;

  return (
    <div className="data-card-item">
      <img src={image.src} alt={image.alt} />
      <div>
        <p>
          {state}<span>{item.name}</span>: {detail}
        </p>
        <div>{config}</div>
      </div>
    </div>
  );
};

export default DataItem;
