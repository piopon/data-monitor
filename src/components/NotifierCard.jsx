const NotifierCard = ({ data }) => {
  return (
    <div className="notifier-card">
      <h3 className="notifier-card-title">{data.type}</h3>
      <div className="notifier-card-items">setting</div>
    </div>
  );
};

export default NotifierCard;
