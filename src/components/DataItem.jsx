const DataItem = ({ item }) => {
  return (
    <div>
      <img src={item.icon} alt={item.name + " logo"} />
      <p>{item.name}: {item.price} {item.currency}</p>
    </div>
  );
};

export default DataItem;
