import unknown from "../assets/images/unknown.png";

const DataItem = ({ item }) => {
  return "OK" === item.status ? (
    <div className="data-card-item">
      <img src={item.icon} alt={item.name + " logo"} />
      <div>
        <p>
          ✔️<span>{item.name}</span>: {item.price} {item.currency}
        </p>
        <div>TRESHOLD SETTINGS...</div>
      </div>
    </div>
  ) : (
    <div className="data-card-item">
      <img src={unknown} alt="Unknown logo" />
      <p>
        ❌<span>{item.name}</span>: {item.reason}
      </p>
    </div>
  );
};

export default DataItem;
