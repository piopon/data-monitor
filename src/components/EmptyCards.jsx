const EmptyCards = ({ showTitle = true, whatToAdd, showFooter = true }) => {
  return (
    <div id="empty-cards-placeholder">
      {showTitle && <span className="empty-title">ah, fresh start, clean vibes...</span>}
      <p>{`perfect moment to add your first ${whatToAdd} to set things in motion!`}</p>
      {showFooter && <span className="empty-footer">(pssst... scraper button will show you the way)</span>}
    </div>
  );
};

export default EmptyCards;
