function ListingCard({
  id,
  title,
  description,
  price,
  category,
  image_url,
  authorName,
  isApproved,
  isModerator,
  canDelete,
  onOpen,
  onDelete,
  onApprove,
}) {
  return (
    <div className="card" onClick={onOpen}>
      {image_url && (
        <img src={image_url} alt={title} className="card-image" />
      )}

      {category && <div className="category">{category}</div>}

      <h2>{title}</h2>
      <p>{description}</p>
      <strong>{price}</strong>

      {authorName && <p className="author">Автор: {authorName}</p>}

      {isModerator && !isApproved && (
        <p className="pending-status">На модерации</p>
      )}

      {(canDelete || (isModerator && !isApproved)) && (
        <div
          className="card-actions"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {isModerator && !isApproved && (
            <button onClick={() => onApprove(id)}>Одобрить</button>
          )}

          {canDelete && (
            <button onClick={() => onDelete(id)}>Удалить</button>
          )}

          {isModerator && !canDelete && (
            <button onClick={() => onDelete(id)}>Удалить</button>
          )}
        </div>
      )}
    </div>
  );
}

export default ListingCard;