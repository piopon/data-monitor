const DataCards = ({ data }) => {
  return (
    <div className="data-cards-div">
      {data.map((item) => (
        <div className="data-card">
          <div className="data-card-header">
            <div className="data-card-category">category: {item.category}</div>
            <h3 className="data-card-title">{item.name}</h3>
          </div>
          <div className="data-card-items">
            {item.items.map((element) => (
              <div>
                <img src={element.icon} alt={element.name+" logo"}/>
                <p>{element.name}: {element.price} {element.currency}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DataCards;
