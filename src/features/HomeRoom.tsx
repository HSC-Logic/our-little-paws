import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sun,
  Flower2,
  ArrowRight,
  Heart,
  Utensils,
  Gamepad2,
  Brush,
  Moon,
  Music,
  Hand,
  Mail,
} from "lucide-react";
import type { Action, World } from "../lib/model";
import { species } from "../lib/model";
import type { Command } from "../lib/api";
import { demo } from "../lib/api";
import { useUI } from "../lib/ui";
import { PetArt } from "../components/PetArt";
import { Room } from "../components/Room";
export function HomeRoom({
  world,
  act,
}: {
  world: World;
  act: (c: Command) => Promise<boolean>;
}) {
  const { selected, select } = useUI();
  const pet = world.pets.find((p) => p.id === selected) || world.pets[0];
  const [renaming, setRenaming] = useState(false);
  function choosePet(id: string) {
    select(id);
    setRenaming(false);
  }
  return (
    <div className="home-view">
      <div className="section-heading home-heading">
        <div>
          <span className="eyebrow">
            <Sun size={14} /> A GOOD DAY TO BE TOGETHER
          </span>
          <h1>
            Our happy little <span>hideaway.</span>
          </h1>
          <p>{world.greeting}</p>
        </div>
        <Link className="secondary" to="/decorate">
          <Flower2 size={16} />
          Make it cozy
        </Link>
      </div>
      <div className="home-play-layout">
        <div className="home-scene-column">
          <div className="scene-topline">
            <span>
              <i className="status-dot" />
              {world.name}
            </span>
            <span>Always a little room for love ♡</span>
          </div>
          <Room
            pets={world.pets}
            selected={pet?.id || ""}
            onSelect={choosePet}
            wall={world.room.wall}
            rug={world.room.rug}
            accessory={world.room.accessory}
            bed={world.room.bed}
          />
        </div>
        {!pet ? (
          <section className="paper adoption-invite">
            <PetArt species="bunny" />
            <div>
              <h2>A home is sweeter with little paws</h2>
              <p>Your first forever friend is waiting to meet you.</p>
            </div>
            <Link to="/pets" className="primary">
              Meet the little ones
              <ArrowRight size={17} />
            </Link>
          </section>
        ) : (
          <section className="care-panel paper" aria-label="Pet care">
            <div className="pet-summary">
              <div className="mini-pet">
                <PetArt species={pet.species} activity={pet.activity} />
              </div>
              <div>
                {renaming ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const name = new FormData(e.currentTarget).get("name");
                      if (await act({ kind: "rename", pet: pet.id, name }))
                        setRenaming(false);
                    }}
                  >
                    <input
                      aria-label="Pet name"
                      name="name"
                      defaultValue={pet.name}
                      maxLength={24}
                      required
                    />
                    <button>Save</button>
                  </form>
                ) : (
                  <button
                    className="name-button"
                    onClick={() => setRenaming(true)}
                  >
                    <h2>{pet.name}</h2>
                    <small>rename</small>
                  </button>
                )}
                <p>{species.find((s) => s.key === pet.species)?.trait}</p>
                <small>
                  Home for{" "}
                  {Math.max(
                    1,
                    Math.ceil(
                      (Date.now() - Date.parse(pet.adopted_at)) / 86400000,
                    ),
                  )}{" "}
                  day(s) · {pet.activity}
                </small>
              </div>
            </div>
            <div className="needs">
              {(["happiness", "fullness", "energy", "affection"] as const).map(
                (n, i) => (
                  <div key={n}>
                    <label>
                      {n}
                      <span>{pet[n]}%</span>
                    </label>
                    <div className={`meter meter-${i}`}>
                      <i style={{ width: pet[n] + "%" }} />
                    </div>
                  </div>
                ),
              )}
            </div>
            <div
              className="care-actions"
              role="group"
              aria-label="Pet care actions"
            >
              <div className="care-actions-heading">
                <span>
                  <Heart size={15} />
                  Little care moments
                </span>
                <label>
                  Care for
                  <select
                    aria-label="Choose a pet to care for"
                    value={pet.id}
                    onChange={(e) => choosePet(e.target.value)}
                  >
                    {world.pets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {(
                [
                  { action: "feed", label: "Feed", icon: Utensils },
                  { action: "treat", label: "Treat", icon: Heart },
                  { action: "cuddle", label: "Cuddle", icon: Heart },
                  { action: "pet", label: "Head pats", icon: Hand },
                  { action: "play", label: "Play", icon: Gamepad2 },
                  { action: "groom", label: "Groom", icon: Brush },
                  {
                    action: pet.activity === "sleep" ? "wake" : "sleep",
                    label: pet.activity === "sleep" ? "Wake" : "Rest",
                    icon: Moon,
                  },
                  { action: "dance", label: "Dance", icon: Music },
                ] as { action: Action; label: string; icon: typeof Heart }[]
              ).map((a) => (
                <button
                  key={a.action}
                  disabled={!demo && !navigator.onLine}
                  onClick={() =>
                    void act({ kind: "care", pet: pet.id, action: a.action })
                  }
                >
                  <a.icon size={20} />
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
      <div className="home-bottom">
        <Link to="/music" className="paper home-card music-card">
          <div className="small-record">♡</div>
          <div>
            <span className="eyebrow">A SOUNDTRACK FOR TWO</span>
            <h3>Stay a little. Listen a little.</h3>
            <p>Soft melodies & dancing paws</p>
          </div>
          <ArrowRight size={19} />
        </Link>
        <Link to="/mail" className="paper home-card mail-card">
          <Mail size={38} />
          <div>
            <span className="eyebrow">SEALED WITH A LITTLE LOVE</span>
            <h3>Some words are worth keeping.</h3>
            <p>Send a note to your favorite person</p>
          </div>
          <ArrowRight size={19} />
        </Link>
      </div>
      <section className="activity">
        <h3>
          <Heart size={17} />
          Little things, lately
        </h3>
        {world.events.length ? (
          world.events.slice(0, 3).map((e) => (
            <p key={e.id}>
              <span className="status-dot" />
              {e.message}
              <small>
                {new Date(e.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </small>
            </p>
          ))
        ) : (
          <p>Your story is just beginning. Make a little memory today.</p>
        )}
      </section>
    </div>
  );
}
