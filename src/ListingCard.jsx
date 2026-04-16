function ListingCard({
  title,
  description,
  price,
  category,
  image_url,
  onOpen,
  onDelete,
  isModerator,
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

      {isModerator && (
        <>
          <br />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            Удалить
          </button>
        </>
      )}
    </div>
  );
}

export default ListingCard;