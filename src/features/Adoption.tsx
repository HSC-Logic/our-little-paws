import { Heart, Check } from "lucide-react";
import { PetArt } from "../components/PetArt";
import { species } from "../lib/model";
import type { Props } from "./types";
export function Adoption({ world, act }: Props) {
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">ROOM FOR A LITTLE MORE LOVE</span>
          <h2>Meet your forever friends</h2>
          <p>Four little personalities. One very happy home.</p>
        </div>
      </div>
      <div className="adoption-grid">
        {species.map((s) => (
          <article className="paper adopt-card" key={s.key}>
            <div
              className="pet-portrait"
              style={{ background: s.color + "33" }}
            >
              <PetArt species={s.key} />
            </div>
            <h3>{s.name}</h3>
            <span className="pill">{s.key}</span>
            <p>{s.trait}</p>
            <small>{s.likes}</small>
            <button
              className="primary"
              disabled={world.pets.some((p) => p.species === s.key)}
              onClick={() => void act({ kind: "adopt", species: s.key })}
            >
              {world.pets.some((p) => p.species === s.key) ? (
                <>
                  <Check size={16} />
                  Already home
                </>
              ) : (
                <>
                  Bring me home <Heart size={16} />
                </>
              )}
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
