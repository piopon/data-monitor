const DataCard = ({ data }) => {
  return (
    <div className="data-card">
      <h3 className="data-card-title">{data.category} {data.name}</h3>
      <div className="data-card-items">
        {data.items.map((element) => (
          <div>
            <img src={element.icon} alt={element.name + " logo"} />
            <p>{element.name}: {element.price} {element.currency}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataCard;
