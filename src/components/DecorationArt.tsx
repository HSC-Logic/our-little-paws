/** Painted item art shares the same camera, textures, and lighting as the room. */
export function DecorationArt({
  item,
  slot,
  label,
}: {
  item: string;
  slot: string;
  label: string;
}) {
  if (item === "christmas-wall")
    return (
      <span
        role="img"
        aria-label={label}
        className="decoration-art decoration-art-wall wall-preview"
      >
        <img
          src={`${import.meta.env.BASE_URL}art/room-christmas.webp`}
          alt=""
          draggable={false}
        />
      </span>
    );
  const file = item.startsWith("christmas-")
    ? `${item}.webp`
    : slot === "wall"
      ? "cozy-room.webp"
      : slot === "rug"
        ? `rug-${item === "honey" ? "honey" : "rose"}.webp`
        : `bed-${item === "mint-bed" ? "mint" : "rose"}.webp`;
  return (
    <span
      role="img"
      aria-label={label}
      className={`decoration-art decoration-art-${slot} ${slot === "wall" ? `wall-preview wall-preview-${item}` : ""}`}
    >
      <img
        src={`${import.meta.env.BASE_URL}art/${file}`}
        alt=""
        draggable={false}
      />
    </span>
  );
}
