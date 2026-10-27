import { Heart, Music, Sparkles, Sun } from "lucide-react";
import { DecorationArt } from "./DecorationArt";
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
    <div className={`room illustrated-room wall-${wall} rug-${rug} bed-${bed}`}>
      <div className="room-scene">
        <img
          className="room-art"
          src={`${import.meta.env.BASE_URL}art/room-base-v2.webp`}
          alt="A colorful isometric dollhouse with lavender walls, a sunny window, fairy lights, a sofa, a record player, and soft pet beds"
          fetchPriority="high"
          draggable={false}
        />
        <div className="room-wall-tint" aria-hidden="true"/>
        <div className="room-rug" aria-hidden="true">
          <DecorationArt item={rug} slot="rug" label="Selected rug" />
        </div>
        {bed && (
          <div className="room-bed" aria-hidden="true">
            <DecorationArt item={bed} slot="bed" label="Selected pet bed" />
          </div>
        )}
        <div className="room-pets">
          {pets.map((p, i) => (
            <button
              key={p.id}
              className={`room-pet pet-species-${p.species} pet-position-${i} ${p.id === selected ? "selected" : ""}`}
              onClick={() => onSelect(p.id)}
              aria-label={`Select ${p.name}`}
              aria-pressed={p.id === selected}
            >
              <PetArt
                species={p.species}
                activity={p.activity}
                accessory={accessory}
              />
              <span className="pet-nameplate">
                {p.name}
                <small>
                  {p.activity === "sleep"
                    ? "Dreaming sweet dreams"
                    : p.id === selected
                      ? "Your little bestie"
                      : "Tap to say hello"}
                </small>
              </span>
              {p.id === selected && (
                <Heart
                  className="selected-pet-heart"
                  size={17}
                  fill="currentColor"
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="room-weather">
        <Sun size={16} />
        <span>A little pocket of sunshine</span>
      </div>
      <div className="room-sparkles" aria-hidden="true">
        <Sparkles />
        <Heart />
        <Sparkles />
        <Music />
      </div>
      {!pets.length && (
        <div className="empty-room-note">
          <Heart size={20} />
          <span>A cozy home, waiting for little paws.</span>
        </div>
      )}
      <span className="room-sticker">
        <Heart size={11} />
        Our favorite place to be
      </span>
    </div>
  );
}
