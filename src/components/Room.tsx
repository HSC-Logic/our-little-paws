import { PetArt } from "./PetArt";
import type { Pet } from "../lib/model";
export function Room({
  pets,
  selected,
  onSelect,
  wall,
  rug,
  accessory,
  bed,
}: {
  pets: Pet[];
  selected: string;
  onSelect: (id: string) => void;
  wall: string;
  rug: string;
  accessory: string;
  bed: string;
}) {
  return (
    <div className={`room wall-${wall}`}>
      <svg
        viewBox="0 0 1000 510"
        className="room-background"
        aria-label="An illustrated cozy living room with a sunny window, sofa, plants, and record player"
        role="img"
      >
        <defs>
          <pattern
            id="wallpaper"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path d="M20 10v6m-3-3h6" stroke="#b59d8622" strokeWidth="2" />
          </pattern>
          <linearGradient id="floor" x2="0" y2="1">
            <stop stopColor="#e8cdb1" />
            <stop offset="1" stopColor="#f1ddc5" />
          </linearGradient>
        </defs>
        <rect width="1000" height="355" fill="var(--wall-color,#f5e8d8)" />
        <rect width="1000" height="355" fill="url(#wallpaper)" />
        <path d="M0 355H1000V510H0Z" fill="url(#floor)" />
        <path
          d="M0 356H1000 M0 372H1000 M50 510L200 372 M310 510L360 372 M690 510L640 372 M950 510L800 372"
          stroke="#c8a98b"
          strokeWidth="2"
          opacity=".5"
        />
        <g stroke="#b59678" strokeWidth="6">
          <rect
            x="385"
            y="48"
            width="225"
            height="213"
            rx="105"
            fill="#f9f1df"
          />
          <path
            d="M402 163V151 A96 96 0 0 1 594 151 V163 Z"
            fill="#cbded8"
            transform="translate(0 0)"
            stroke="none"
          />
          <path d="M401 163H594V245H401Z" fill="#dce8d9" stroke="none" />
          <path d="M498 54V255 M391 162H604" />
          <path d="M376 261H619" strokeWidth="12" />
        </g>
        <circle cx="549" cy="113" r="24" fill="#fff0be" />
        <path
          d="M415 237Q441 193 473 237 M511 237Q544 178 580 237"
          fill="#a9c4ac"
        />
        <g fill="#dfbdac" stroke="#b28f7e" strokeWidth="3">
          <rect x="99" y="244" width="238" height="111" rx="31" />
          <rect x="91" y="290" width="44" height="77" rx="17" />
          <rect x="306" y="290" width="44" height="77" rx="17" />
          <path d="M136 327H305" />
          <path d="M119 364v18 M322 364v18" strokeWidth="9" />
          <rect
            x="151"
            y="266"
            width="62"
            height="56"
            rx="14"
            fill="#f4e6cd"
            transform="rotate(-9 180 295)"
          />
          <rect
            x="242"
            y="269"
            width="49"
            height="50"
            rx="12"
            fill="#b5c3a6"
            transform="rotate(12 265 295)"
          />
        </g>
        <ellipse
          cx="506"
          cy="435"
          rx="282"
          ry="62"
          fill={rug === "honey" ? "#eacb8e" : "#d6afa6"}
          stroke="#fff1dd"
          strokeWidth="6"
        />
        <ellipse
          cx="506"
          cy="435"
          rx="258"
          ry="49"
          fill="none"
          stroke="#fff1dd88"
          strokeWidth="2"
        />
        <ellipse
          cx="641"
          cy="427"
          rx="65"
          ry="23"
          fill={bed === "mint-bed" ? "#b5c5ae" : "#dabbb6"}
          stroke="#fff0df"
          strokeWidth="4"
        />
        <ellipse cx="641" cy="423" rx="46" ry="13" fill="#f4e5d3" />
        <g stroke="#957960" strokeWidth="4">
          <path d="M790 312V400 M919 312V400" />
          <rect x="775" y="283" width="160" height="54" rx="8" fill="#c89e78" />
          <path d="M791 284V237H916V284" fill="#e0b88f" />
          <ellipse cx="854" cy="267" rx="43" ry="11" fill="#6c6261" />
          <ellipse cx="854" cy="267" rx="14" ry="5" fill="#dbb7a0" />
          <path d="M900 250L875 270" />
        </g>
        <g stroke="#819a77" strokeWidth="5" fill="#b3c3a0">
          <path d="M724 325V226" />
          <ellipse
            cx="707"
            cy="248"
            rx="12"
            ry="27"
            transform="rotate(-40 707 248)"
          />
          <ellipse
            cx="740"
            cy="270"
            rx="12"
            ry="29"
            transform="rotate(40 740 270)"
          />
          <path
            d="M697 308H752L744 357H705Z"
            fill="#dfc1a5"
            stroke="#b39379"
            strokeWidth="3"
          />
        </g>
        <g stroke="#b99b7e" strokeWidth="4">
          <rect x="172" y="70" width="78" height="98" rx="4" fill="#fff5e5" />
          <path
            d="M191 126Q210 98 230 126Q210 158 191 126"
            fill="#dba5ac"
            stroke="none"
          />
          <path d="M682 112H795" strokeWidth="9" />
          <path d="M696 110V87Q712 60 728 87V110" fill="#d7c3b3" />
          <circle cx="761" cy="96" r="14" fill="#c9b5cf" />
        </g>
        <ellipse cx="87" cy="421" rx="43" ry="16" fill="#b7bfa2" />
        <ellipse cx="87" cy="416" rx="29" ry="8" fill="#f6ebd8" />
        <path d="M904 417q-26-68-54 0Z" fill="#c3a484" />
        <path d="M851 399h52" stroke="#99785e" strokeWidth="3" />
        <circle cx="867" cy="386" r="14" fill="#ddaea2" />
        <path d="M883 387l14-27" stroke="#a0b39b" strokeWidth="9" />
      </svg>
      <div className="room-pets">
        {pets.map((p, i) => (
          <button
            key={p.id}
            className={`room-pet pet-position-${i} ${p.id === selected ? "selected" : ""}`}
            onClick={() => onSelect(p.id)}
            aria-label={`Select ${p.name}`}
          >
            <PetArt
              species={p.species}
              activity={p.activity}
              accessory={accessory}
            />
            <span>
              {p.name}
              <small>
                {p.activity === "sleep" ? "Sweet dreams" : "Happy to be home"}
              </small>
            </span>
          </button>
        ))}
      </div>
      <span className="room-sticker">made of little happy moments</span>
    </div>
  );
}
