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
    </div>
  );
};

export default DataItem;
