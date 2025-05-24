const DataCard = ({ data }) => {
  return (
    <div className="data-card">
      <div className="data-card-header">
        <div className="data-card-category">category: {data.category}</div>
        <h3 className="data-card-title">{data.name}</h3>
      </div>
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
