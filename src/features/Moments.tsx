import { useState } from "react";
import {
  Gift,
  Star,
  Heart,
  Sparkles,
  ArrowUpRight,
  Shuffle,
} from "lucide-react";
import type { Props } from "./types";
export function Moments({ world, act }: Props) {
  const [surprise, setSurprise] = useState(false);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [drawnId, setDrawnId] = useState<string>();
  const [saved, setSaved] = useState(0);
  const [drawCount, setDrawCount] = useState(0);
  const memories = world.memories || [];
  const drawn = memories.find((memory) => memory.id === drawnId);
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE LITTLE THINGS ARE THE BIG THINGS</span>
          <h2>Our jar of happy moments</h2>
          <p>Every little act of love leaves a little sparkle.</p>
        </div>
      </div>
      <section className="paper memory-jar" aria-labelledby="memory-jar-title">
        <div className="memory-jar-layout">
          <div className="memory-jar-display">
            <div className="memory-jar-halo" aria-hidden="true" />
            <div className="memory-jar-object" key={saved}>
              <img
                src={`${import.meta.env.BASE_URL}art/memory-jar.webp`}
                alt="A glass keepsake jar with a pink ribbon, folded love notes and golden fairy lights"
                draggable={false}
              />
              {saved > 0 && (
                <span className="memory-falling-note" aria-hidden="true">
                  <Heart size={18} />
                </span>
              )}
            </div>
            <span className="jar-twinkle jar-twinkle-one" aria-hidden="true">
              ✦
            </span>
            <span className="jar-twinkle jar-twinkle-two" aria-hidden="true">
              ✧
            </span>
            <span className="jar-twinkle jar-twinkle-three" aria-hidden="true">
              ♡
            </span>
            <span className="memory-jar-count">
              <Heart size={14} /> {memories.length} little{" "}
              {memories.length === 1 ? "memory" : "memories"}
            </span>
            <p className="memory-jar-caption">
              A little glass jar. A whole lot of us.
            </p>
          </div>
          <div className="memory-jar-compose">
            <div>
              <span className="eyebrow">LITTLE NOTES, FOREVER KEPT</span>
              <h3 id="memory-jar-title">Our Memory Jar</h3>
              <p>
                {memories.length}{" "}
                {memories.length === 1 ? "memory" : "memories"} tucked away.
                Shared with your person.
              </p>
            </div>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                if (saving || !body.trim()) return;
                setSaving(true);
                try {
                  if (await act({ kind: "memory", body: body.trim() })) {
                    setBody("");
                    setSaved((value) => value + 1);
                  }
                } finally {
                  setSaving(false);
                }
              }}
            >
              <label htmlFor="memory-note">A moment worth keeping</label>
              <textarea
                id="memory-note"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                maxLength={1000}
                required
                rows={3}
                placeholder="That little thing you did today that made me smile..."
              />
              <div className="memory-compose-footer">
                <span className="memory-character-count">
                  {body.length} / 1000
                </span>
              </div>
              <button className="primary" disabled={saving || !body.trim()}>
                <Heart size={16} aria-hidden="true" />{" "}
                {saving ? "Saving..." : "Tuck into our jar"}
              </button>
            </form>
            <div className="memory-draw-actions">
              <button
                className="secondary"
                disabled={!memories.length}
                onClick={() => {
                  setDrawCount((value) => value + 1);
                  const choices = memories.filter(
                    (memory) => memory.id !== drawnId,
                  );
                  const pool = choices.length ? choices : memories;
                  setDrawnId(pool[Math.floor(Math.random() * pool.length)].id);
                }}
              >
                <Shuffle size={16} aria-hidden="true" /> Draw a memory
              </button>
              <span>Let a happy moment find you.</span>
            </div>
            <div role="status" className="memory-drawn">
              {drawn ? (
                <article key={drawCount} className="memory-reveal">
                  <span className="eyebrow">
                    <Sparkles size={14} aria-hidden="true" /> A MOMENT TO RELIVE
                  </span>
                  <p>{drawn.body}</p>
                  <small>
                    {world.members.find((member) => member.id === drawn.author)
                      ?.name || "Your person"}{" "}
                    ·{" "}
                    <time dateTime={drawn.created_at}>
                      {new Date(drawn.created_at).toLocaleDateString()}
                    </time>
                  </small>
                </article>
              ) : saved > 0 ? (
                <p className="memory-saved-message" key={saved}>
                  <Heart size={15} aria-hidden="true" /> Safely tucked away.
                  Another little piece of us.
                </p>
              ) : null}
            </div>
            {!memories.length ? (
              <p className="memory-empty">
                Your jar is waiting for its first little memory. Start with
                something that made you smile.
              </p>
            ) : (
              <details>
                <summary>
                  Read all our memories{" "}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </summary>
                <div className="memory-notes">
                  {memories.map((memory) => (
                    <article key={memory.id} className="paper">
                      <p>{memory.body}</p>
                      <small>
                        {world.members.find(
                          (member) => member.id === memory.author,
                        )?.name || "Your person"}{" "}
                        ·{" "}
                        <time dateTime={memory.created_at}>
                          {new Date(memory.created_at).toLocaleDateString()}
                        </time>
                      </small>
                    </article>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      </section>
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
