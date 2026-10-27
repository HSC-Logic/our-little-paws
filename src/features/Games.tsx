import { useState, useEffect } from "react";
import { Play, Gift, Music } from "lucide-react";
import { PetArt } from "../components/PetArt";
import type { Props } from "./types";
export function Games({ act }: Props) {
  const [game, setGame] = useState("treats"),
    [status, setStatus] = useState("ready"),
    [score, setScore] = useState(0),
    [step, setStep] = useState(0),
    [position, setPosition] = useState(50),
    [fall, setFall] = useState(0),
    [target, setTarget] = useState(50);
  const notes = ["C", "E", "G", "E", "C"];
  useEffect(() => {
    if (status !== "playing" || game !== "treats") return;
    const t = setInterval(() => setFall((f) => f + 5), 120);
    return () => clearInterval(t);
  }, [status, game]);
  useEffect(() => {
    if (fall < 90) return;
    if (Math.abs(position - target) < 18) setScore((s) => s + 1);
    setFall(0);
    setTarget(10 + Math.random() * 80);
    setStep((s) => s + 1);
  }, [fall, position, target]);
  useEffect(() => {
    if (step >= 10 && status === "playing") setStatus("finished");
  }, [step, status]);
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">A LITTLE TIME TO PLAY</span>
          <h2>Tiny games, happy paws</h2>
          <p>No rush. No streaks. Just a little fun.</p>
        </div>
      </div>
      <div className="tabs">
        {["treats", "notes"].map((g) => (
          <button
            className={game === g ? "active" : ""}
            key={g}
            onClick={() => {
              setGame(g);
              setStatus("ready");
              setScore(0);
              setStep(0);
            }}
          >
            {g === "treats" ? "Catch the Treats" : "Musical Notes"}
          </button>
        ))}
      </div>
      <section className="paper game">
        <h3>
          {game === "treats"
            ? "A snack-sized adventure"
            : "Follow the little melody"}
        </h3>
        <p>
          {game === "treats"
            ? "Move with the slider or arrow keys. Catch 10 falling treats."
            : "Tap the highlighted notes in order. Sound is optional."}
        </p>
        {status === "playing" || status === "paused" ? (
          <>
            {game === "treats" ? (
              <>
                <div className="catch-field">
                  <span
                    className="falling-treat"
                    style={{ left: target + "%", top: fall + "%" }}
                  >
                    ♥
                  </span>
                  <div className="catch-pet" style={{ left: position + "%" }}>
                    <PetArt species="hamster" activity="play" />
                  </div>
                </div>
                <label>
                  Move your little friend
                  <input
                    aria-label="Move pet"
                    type="range"
                    min="0"
                    max="100"
                    value={position}
                    onChange={(e) => setPosition(+e.target.value)}
                  />
                </label>
                <button
                  onClick={() => {
                    if (status === "playing") {
                      setScore((s) => s + 1);
                      setStep((s) => s + 1);
                      setFall(0);
                    }
                  }}
                >
                  Accessible catch
                </button>
              </>
            ) : (
              <div>
                <p aria-live="polite">Next note: {notes[step % 5]}</p>
                <div className="notes">
                  {["C", "D", "E", "F", "G"].map((n) => (
                    <button
                      disabled={status !== "playing"}
                      className={notes[step % 5] === n ? "active" : ""}
                      key={n}
                      onClick={() => {
                        if (n === notes[step % 5]) {
                          setScore((s) => s + 1);
                          setStep((s) => s + 1);
                        }
                      }}
                    >
                      {n}
                      <Music />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p>
              Score: {score} · Round {Math.min(step + 1, 10)} / 10
            </p>
            <button
              className="secondary"
              onClick={() =>
                setStatus(status === "paused" ? "playing" : "paused")
              }
            >
              {status === "paused" ? "Resume" : "Pause"}
            </button>
            <button onClick={() => setStatus("finished")}>Finish</button>
          </>
        ) : (
          <>
            <div className="game-mascot">
              <PetArt
                species={game === "treats" ? "hamster" : "bunny"}
                activity="happy"
              />
            </div>
            {status === "finished" && (
              <p>You made {score} happy little moments!</p>
            )}
            <button
              className="primary"
              onClick={() => {
                setStatus("playing");
                setScore(0);
                setStep(0);
                setFall(0);
              }}
            >
              <Play size={17} />
              {status === "ready" ? "Let’s play" : "Play again"}
            </button>
            {status === "finished" && (
              <button
                className="secondary"
                onClick={() => void act({ kind: "game", game })}
              >
                <Gift size={16} />
                Collect participation gift · 3 treats
              </button>
            )}
          </>
        )}
        <small>
          Scores are just for fun. Participation gifts are fixed and limited to
          one per minute.
        </small>
      </section>
    </>
  );
}
