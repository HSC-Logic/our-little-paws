import { useState } from "react";
import { Gift, Star } from "lucide-react";
import type { Props } from "./types";
export function Moments({ world }: Pick<Props, "world">) {
  const [surprise, setSurprise] = useState(false);
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE LITTLE THINGS ARE THE BIG THINGS</span>
          <h2>Our jar of happy moments</h2>
          <p>Every little act of love leaves a little sparkle.</p>
        </div>
      </div>
      <button className="surprise paper" onClick={() => setSurprise(!surprise)}>
        <Gift size={40} />
        <h3>
          {surprise
            ? world.surprise || "You make ordinary days feel like home."
            : "A little something for you"}
        </h3>
        <p>
          {surprise
            ? "Here’s to all the little moments still to come."
            : "Tap to unwrap a tiny reminder."}
        </p>
        {surprise && <span className="heart-rain">♡　♡　♡　♡　♡</span>}
      </button>
      <div className="achievement-grid">
        {[
          "First Cuddle",
          "Happy Little Family",
          "Music Lovers",
          "Cozy Home",
          "Best Pet Parents",
          "First Letter",
        ].map((a) => (
          <article
            className={`paper achievement ${world.achievements.includes(a) ? "unlocked" : ""}`}
            key={a}
          >
            <Star size={30} />
            <h3>{a}</h3>
            <small>
              {world.achievements.includes(a)
                ? "A memory to keep"
                : "A little memory waiting to happen"}
            </small>
          </article>
        ))}
      </div>
    </>
  );
}
