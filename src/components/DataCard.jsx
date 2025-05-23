const DataCard = ({data}) => {
  return (
    <p>
      {data.name} - {data.category} - {data.items.length} item(s)
    </p>
  );
};

export default DataCard;
