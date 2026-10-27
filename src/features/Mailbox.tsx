import { useState } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { Mail, Star, Send, Heart, X } from "lucide-react";
import { Dialog } from "../components/Dialog";
import type { Props } from "./types";
export function Mailbox({ world, act }: Props) {
  const [compose, setCompose] = useState(false),
    [filter, setFilter] = useState("all"),
    [open, setOpen] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<{
    subject: string;
    body: string;
    recipient: string;
    envelope: string;
  }>({
    defaultValues: {
      recipient:
        world.members.find((m) => m.id !== world.viewerId)?.id || "partner",
      envelope: "rose",
    },
  });
  const current = world.letters.find((l) => l.id === open);
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">LITTLE WORDS, BIG FEELINGS</span>
          <h2>Letters for your person</h2>
          <p>A soft place for everything you want to say.</p>
        </div>
        <button className="primary" onClick={() => setCompose(true)}>
          <Send size={17} />
          Write a little letter
        </button>
      </div>
      <div className="tabs">
        {["all", "unread", "favorites"].map((f) => (
          <button
            key={f}
            className={f === filter ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="letter-grid">
        {world.letters
          .filter(
            (l) =>
              filter === "all" ||
              (filter === "unread" &&
                !l.read &&
                l.recipient === world.viewerId) ||
              (filter === "favorites" && l.favorite),
          )
          .map((l) => (
            <button
              key={l.id}
              className={`paper envelope envelope-${l.envelope}`}
              onClick={() => {
                setOpen(l.id);
                void act({ kind: "letter-state", id: l.id, read: true });
              }}
            >
              <Mail size={42} />
              <h3>{l.subject}</h3>
              <span>
                {new Date(l.created_at).toLocaleDateString()}{" "}
                {!l.read && " · Unopened"}
              </span>
            </button>
          ))}
      </div>
      {!world.letters.length && (
        <div className="empty paper">
          <Mail size={58} />
          <h3>Your first little letter awaits</h3>
          <p>A favorite memory, a thank you, or just “thinking of you”.</p>
        </div>
      )}
      {compose && (
        <Dialog onClose={() => setCompose(false)}>
          <section
            className="modal paper"
            role="dialog"
            aria-modal="true"
            aria-labelledby="compose-title"
          >
            <button
              className="close"
              aria-label="Close letter"
              onClick={() => setCompose(false)}
            >
              <X />
            </button>
            <h2 id="compose-title">A little love note</h2>
            <form
              onSubmit={handleSubmit(async (values) => {
                if (await act({ kind: "letter", ...values })) {
                  reset();
                  setCompose(false);
                }
              })}
            >
              <label>
                To
                <select {...register("recipient")}>
                  {world.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Envelope
                <select {...register("envelope")}>
                  <option value="rose">Rose petals</option>
                  <option value="sage">Sage garden</option>
                  <option value="lavender">Lavender skies</option>
                </select>
              </label>
              <label>
                Subject
                <input required maxLength={100} {...register("subject")} />
              </label>
              <label>
                Your words
                <textarea
                  required
                  rows={6}
                  maxLength={4000}
                  {...register("body")}
                />
              </label>
              <button className="primary" disabled={isSubmitting}>
                <Send size={16} />
                Seal with love
              </button>
            </form>
          </section>
        </Dialog>
      )}
      {current && (
        <Dialog onClose={() => setOpen("")}>
          <motion.article
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="modal paper letter-open"
            role="dialog"
            aria-modal="true"
            aria-label={current.subject}
          >
            <button
              className="close"
              aria-label="Close"
              onClick={() => setOpen("")}
            >
              <X />
            </button>
            <Heart size={30} />
            <h2>{current.subject}</h2>
            <p>{current.body}</p>
            <button
              onClick={() =>
                void act({
                  kind: "letter-state",
                  id: current.id,
                  favorite: !current.favorite,
                })
              }
            >
              <Star fill={current.favorite ? "#e5bd78" : "none"} />
              {current.favorite
                ? "Saved close to your heart"
                : "Keep as a favorite"}
            </button>
          </motion.article>
        </Dialog>
      )}
    </>
  );
}
