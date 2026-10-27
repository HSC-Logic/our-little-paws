import type { Species } from "../lib/model";
export function PetArt({
  species = "puppy",
  activity = "idle",
  accessory = "",
  className = "",
}: {
  species?: Species;
  activity?: string;
  accessory?: string;
  className?: string;
}) {
  const fur = {
    puppy: "#edc398",
    kitten: "#b9b4ca",
    bunny: "#f5e7da",
    hamster: "#e2af70",
  }[species];
  return (
    <svg
      viewBox="0 0 200 210"
      role="img"
      aria-label={`${species} ${activity}`}
      className={`pet-art ${activity} ${className}`}
    >
      <ellipse cx="101" cy="192" rx="62" ry="10" fill="#674c5518" />
      <g
        className="pet-body"
        stroke="#795e55"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M143 151 Q188 127 167 168" fill={fur} />
        <ellipse cx="100" cy="151" rx="48" ry="43" fill={fur} />
        <ellipse
          cx="100"
          cy="158"
          rx="27"
          ry="30"
          fill="#fff3e3"
          stroke="none"
        />
        <ellipse cx="66" cy="184" rx="19" ry="10" fill={fur} />
        <ellipse cx="133" cy="184" rx="19" ry="10" fill={fur} />
        <g className="pet-head">
          {species === "bunny" ? (
            <>
              <ellipse
                cx="73"
                cy="43"
                rx="15"
                ry="39"
                fill={fur}
                transform="rotate(-12 73 43)"
              />
              <ellipse
                cx="126"
                cy="43"
                rx="15"
                ry="39"
                fill={fur}
                transform="rotate(12 126 43)"
              />
              <path
                d="M73 20 L77 58 M127 20 L123 58"
                stroke="#e9bcb9"
                strokeWidth="9"
              />
            </>
          ) : species === "kitten" ? (
            <>
              <path
                d="M56 79 L51 28 L88 55 M112 55 L149 28 L144 84"
                fill={fur}
              />
              <path
                d="M59 42 L64 66 M139 42 L134 66"
                stroke="#e4b8ba"
                strokeWidth="9"
              />
            </>
          ) : (
            <>
              <ellipse
                cx="55"
                cy="72"
                rx={species === "puppy" ? 20 : 19}
                ry={species === "puppy" ? 37 : 19}
                fill={species === "puppy" ? "#ba8865" : fur}
                transform="rotate(22 55 72)"
              />
              <ellipse
                cx="145"
                cy="72"
                rx="19"
                ry={species === "puppy" ? 37 : 19}
                fill={species === "puppy" ? "#ba8865" : fur}
                transform="rotate(-22 145 72)"
              />
            </>
          )}
          <ellipse cx="100" cy="94" rx="57" ry="49" fill={fur} />
          <ellipse
            cx="100"
            cy="113"
            rx="33"
            ry="25"
            fill="#fff3e3"
            stroke="none"
          />
          <g className="eyes" fill="#594842" stroke="none">
            <ellipse cx="77" cy="91" rx="4.5" ry="6" />
            <ellipse cx="123" cy="91" rx="4.5" ry="6" />
            <circle cx="78" cy="89" r="1.5" fill="white" />
            <circle cx="124" cy="89" r="1.5" fill="white" />
          </g>
          <ellipse
            cx="64"
            cy="108"
            rx="10"
            ry="6"
            fill="#e8a7a3"
            opacity=".65"
            stroke="none"
          />
          <ellipse
            cx="136"
            cy="108"
            rx="10"
            ry="6"
            fill="#e8a7a3"
            opacity=".65"
            stroke="none"
          />
          <path d="M94 108 Q100 104 106 108 L100 114 Z" fill="#795e55" />
          <path
            d="M100 114 Q91 127 84 117 M100 114 Q109 127 116 117"
            fill="none"
          />
          {accessory === "bow" && (
            <path
              d="M108 53 Q140 28 135 62 L119 56 Q94 72 96 48 Z"
              fill="#d88d9b"
            />
          )}
          {accessory === "hat" && (
            <path d="M79 52 L104 5 L128 53 Z" fill="#e3b7c6" />
          )}
        </g>
        <path d="M59 143 Q43 159 60 166 M141 143 Q157 159 140 166" fill={fur} />
      </g>
      {activity === "sleep" && (
        <text x="145" y="43" fill="#795e55" fontSize="24">
          z z
        </text>
      )}
    </svg>
  );
}
