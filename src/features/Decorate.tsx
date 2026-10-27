import { Heart, Sparkles } from "lucide-react";
import { PetArt } from "../components/PetArt";
import { catalog } from "../lib/model";
import type { Props } from "./types";
export function Decorate({ world, act }: Props) {
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">MAKE YOURSELF AT HOME</span>
          <h2>A cozy corner of your own</h2>
          <p>Little details that make this world feel like you.</p>
        </div>
        <span className="pill">
          <Heart size={15} /> {world.treats} Love Treats
        </span>
      </div>
      <div className="decoration-grid">
        {catalog.map((item) => (
          <article className="paper decoration" key={item.id}>
            <div className={`swatch swatch-${item.id}`}>
              {item.slot === "accessory" ? (
                <PetArt species="kitten" accessory={item.id} />
              ) : (
                <Sparkles size={42} />
              )}
            </div>
            <small>{item.slot}</small>
            <h3>{item.name}</h3>
            <button
              className="secondary"
              onClick={() => void act({ kind: "decorate", item: item.id })}
            >
              {world.room[item.slot] === item.id
                ? "In your home"
                : world.inventory.includes(item.id)
                  ? "Place in home"
                  : `Unlock · ${item.cost} treats`}
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
