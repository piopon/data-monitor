const DataCards = ({ data }) => {
  return (
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {data.map((item) => (
        <p>
          {item.name} - {item.category} - {item.items.length} item(s)
        </p>
      ))}
    </div>
  );
};

export default DataCards;
