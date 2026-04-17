function ListingCard({
  id,
  title,
  description,
  price,
  category,
  image_url,
  authorName,
  canDelete,
  isModeratorMode,
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

      {(canDelete || isModeratorMode) && (
        <div
          className="card-actions"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {isModeratorMode && (
            <button onClick={() => onApprove(id)}>Опубликовать</button>
          )}

          {(canDelete || isModeratorMode) && (
            <button onClick={() => onDelete(id)}>Удалить</button>
          )}
        </div>
      )}
    </div>
  );
}

export default ListingCard;