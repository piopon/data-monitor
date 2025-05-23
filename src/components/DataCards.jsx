const DataCards = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {data.map((item) => (
        <div className="bg-white rounded-xl shadow-lg relative">
          <div className="p-4">
            <div className="mb-2">
              <div className="text-gray-400 my-2">category: {item.category}</div>
              <h3 className="text-xl font-bold">{item.name}</h3>
            </div>
            <div className="mb-6">
              {item.items.map((element) => (
                <p className="text-md">{element.name}: {element.price} {element.currency}</p>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DataCards;
