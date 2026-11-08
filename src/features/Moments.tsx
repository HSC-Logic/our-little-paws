import { useState } from "react";
import { Gift, Star } from "lucide-react";
import type { Props } from "./types";
export function Moments({ world, act }: Props) {
  const [surprise, setSurprise] = useState(false);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [drawnId, setDrawnId] = useState<string>();
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
        <div>
          <span className="eyebrow">LITTLE NOTES, FOREVER KEPT</span>
          <h3 id="memory-jar-title">Our Memory Jar</h3>
          <p>
            {memories.length} {memories.length === 1 ? "memory" : "memories"}{" "}
            tucked away. Shared with your person.
          </p>
        </div>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (saving || !body.trim()) return;
            setSaving(true);
            try {
              if (await act({ kind: "memory", body: body.trim() })) setBody("");
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
          <button className="primary" disabled={saving || !body.trim()}>
            {saving ? "Saving..." : "Tuck into our jar"}
          </button>
        </form>
        <button
          className="secondary"
          disabled={!memories.length}
          onClick={() => {
            const choices = memories.filter((memory) => memory.id !== drawnId);
            const pool = choices.length ? choices : memories;
            setDrawnId(pool[Math.floor(Math.random() * pool.length)].id);
          }}
        >
          Draw a memory
        </button>
        <div role="status" className="memory-drawn">
          {drawn && <p>{drawn.body}</p>}
        </div>
        {!memories.length ? (
          <p>Your jar is waiting for its first little memory.</p>
        ) : (
          <details>
            <summary>Read all our memories</summary>
            <div className="memory-notes">
              {memories.map((memory) => (
                <article key={memory.id} className="paper">
                  <p>{memory.body}</p>
                  <small>
                    {world.members.find((member) => member.id === memory.author)
                      ?.name || "Your person"}{" "}
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
