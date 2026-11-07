import { Heart, Lock, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { DecorationArt } from "../components/DecorationArt";
import { PetArt } from "../components/PetArt";
import { catalog, christmasExpired } from "../lib/model";
import type { Props } from "./types";
export function Decorate({ world, act }: Props) {
  const [expired, setExpired] = useState(christmasExpired);
  useEffect(() => {
    const timer = window.setInterval(
      () => setExpired(christmasExpired()),
      1000,
    );
    return () => window.clearInterval(timer);
  }, []);
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
      <div className="christmas-banner">
        <Gift aria-hidden="true" />
        <div>
          <span className="eyebrow">RED, GOLD & LITTLE PAWS</span>
          <h3>A very cozy Christmas</h3>
          <p>
            {expired
              ? "Season ended. Christmas keepsakes are locked."
              : "A tree, golden stars, wrapped gifts and a little Santa magic."}
          </p>
          <small>
            Available through December 31, 2026 (Sri Lanka time). Then locked,
            including owned items.
          </small>
        </div>
      </div>
      <div className="decoration-grid">
        {catalog.map((item) => {
          const seasonal = item.id.startsWith("christmas-");
          const locked = seasonal && expired;
          return (
            <article
              className={`paper decoration ${seasonal ? "christmas-decoration" : ""}`}
              key={item.id}
            >
              <div className={`swatch swatch-${item.id}`}>
                {item.slot === "accessory" ? (
                  <PetArt species="kitten" accessory={item.id} />
                ) : (
                  <DecorationArt
                    item={item.id}
                    slot={item.slot}
                    label={item.name}
                  />
                )}
              </div>
              <small>{item.slot}</small>
              {seasonal && (
                <span className="christmas-label">
                  {locked ? "Season ended" : "Christmas exclusive"}
                </span>
              )}
              <h3>{item.name}</h3>
              <button
                className="secondary"
                disabled={locked}
                onClick={() => void act({ kind: "decorate", item: item.id })}
              >
                {locked ? (
                  <>
                    <Lock size={14} aria-hidden="true" /> Expired & locked
                  </>
                ) : world.room[item.slot] === item.id ? (
                  "In your home"
                ) : world.inventory.includes(item.id) ? (
                  "Place in home"
                ) : (
                  `Unlock · ${item.cost} treats`
                )}
              </button>
            </article>
          );
        })}
      </div>
    </>
  );
}
