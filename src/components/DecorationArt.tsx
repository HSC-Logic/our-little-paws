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
        className="decoration-art decoration-art-wall"
      >
        <img
          src={`${import.meta.env.BASE_URL}art/room-christmas.webp`}
          alt=""
          draggable={false}
        />
      </span>
    );
  if (item.startsWith("christmas-"))
    return (
      <span
        role="img"
        aria-label={label}
        className={`decoration-art decoration-art-${slot}`}
      >
        <svg viewBox="0 0 240 180" aria-hidden="true" className="christmas-art">
          {slot === "wall" ? (
            <>
              <path
                d="M15 20Q120 72 225 20"
                fill="none"
                stroke="#d9ac45"
                strokeWidth="3"
              />
              {[30, 65, 100, 140, 175, 210].map((x) => (
                <circle
                  key={x}
                  cx={x}
                  cy={24 + Math.sin(((x - 15) / 210) * Math.PI) * 24}
                  r="5"
                  fill="#ffe49b"
                />
              ))}
              <path d="M113 129h14v30h-14z" fill="#82502e" />
              <path
                d="M120 32L80 88h18l-35 42h24l-34 28h134l-34-28h24l-35-42h18z"
                fill="#235d40"
                stroke="#d5ac50"
                strokeWidth="3"
              />
              <path
                d="M120 13l5 13 14 1-11 9 3 14-11-8-12 8 4-14-11-9 14-1z"
                fill="#f2c65c"
              />
              <path
                d="M96 81l47 17m-62 23 78 18"
                stroke="#f0bd53"
                strokeWidth="5"
              />
              {[
                [107, 67],
                [135, 79],
                [94, 108],
                [145, 117],
                [114, 139],
              ].map(([x, y]) => (
                <circle
                  key={x}
                  cx={x}
                  cy={y}
                  r="6"
                  fill="#c63438"
                  stroke="#f7d784"
                  strokeWidth="2"
                />
              ))}
              <rect
                x="29"
                y="140"
                width="43"
                height="32"
                rx="4"
                fill="#aa222e"
              />
              <path d="M50 140v32m-21-20h43" stroke="#f0c35f" strokeWidth="6" />
              <rect
                x="168"
                y="135"
                width="47"
                height="37"
                rx="4"
                fill="#efc266"
              />
              <path
                d="M192 135v37m-24-22h47"
                stroke="#b52933"
                strokeWidth="6"
              />
            </>
          ) : slot === "rug" ? (
            <>
              <ellipse
                cx="120"
                cy="113"
                rx="108"
                ry="49"
                fill="#982330"
                stroke="#e5ba58"
                strokeWidth="7"
              />
              <ellipse
                cx="120"
                cy="113"
                rx="94"
                ry="37"
                fill="none"
                stroke="#e5ba58"
                strokeWidth="2"
                strokeDasharray="5 5"
              />
              <path
                d="M120 84l9 18 25 3-18 13 5 19-21-10-21 10 5-19-18-13 25-3z"
                fill="#edc66e"
              />
            </>
          ) : (
            <>
              <rect
                x="29"
                y="67"
                width="182"
                height="98"
                rx="29"
                fill="#a62232"
                stroke="#e3b350"
                strokeWidth="6"
              />
              <ellipse
                cx="120"
                cy="101"
                rx="77"
                ry="36"
                fill="#f5dca1"
                stroke="#d1a047"
                strokeWidth="4"
              />
              <ellipse cx="120" cy="102" rx="59" ry="23" fill="#ca4950" />
              <path
                d="M120 137v28m-14-15q-28-30-30-9t44 9q44 12 44-9t-30 9"
                fill="none"
                stroke="#f4cf77"
                strokeWidth="8"
              />
            </>
          )}
        </svg>
      </span>
    );
  const file =
    slot === "wall"
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
