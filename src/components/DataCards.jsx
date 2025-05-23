const DataCards = ({ data }) => {
  return (
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data.map((item) => (
        <div class="bg-white rounded-xl shadow-lg relative">
          <div class="p-4">
            <div class="text-gray-600 my-2">category: {item.category}</div>
            <h3 class="text-xl font-bold">{item.name}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DataCards;
