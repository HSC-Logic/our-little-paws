import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { care, initialWorld, species, catalog } from "./model";
import type { World, Action, Species } from "./model";
const url = import.meta.env.VITE_SUPABASE_URL,
  key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key) : null;
export const demo = !supabase;
const storageKey = "little-paws-world-v1";
const letterSchema = z.object({
  subject: z.string().trim().min(1).max(100),
  body: z.string().trim().min(1).max(4000),
  recipient: z.string().min(1),
  envelope: z.enum(["rose", "sage", "lavender"]),
});
export type Command = { kind: string; [key: string]: unknown };
function receipts(): string[] {
  try {
    return JSON.parse(localStorage.getItem("little-paws-receipts") || "[]");
  } catch {
    return [];
  }
}
export async function getWorld(): Promise<World> {
  if (supabase) {
    const { data, error } = await supabase.rpc("get_world");
    if (error) throw new Error(error.message);
    return data as World;
  }
  try {
    return (
      JSON.parse(localStorage.getItem(storageKey) || "null") || initialWorld()
    );
  } catch {
    return initialWorld();
  }
}
export async function command(
  input: Command,
  id: string = crypto.randomUUID(),
): Promise<World> {
  if (!navigator.onLine && !demo)
    throw new Error("You are offline. Reconnect to share this moment.");
  if (supabase) {
    const { data, error } = await supabase.rpc("world_action", {
      p_command: input,
      p_key: id,
    });
    if (error) throw new Error(error.message);
    return data as World;
  }
  const w = await getWorld();
  if (receipts().includes(id)) return w;
  let message = "";
  if (input.kind === "adopt") {
    const s = species.find((s) => s.key === input.species);
    if (!s) throw new Error("Choose a little friend.");
    if (w.pets.some((p) => p.species === s.key))
      throw new Error("This little friend is already home.");
    w.pets.push({
      id: crypto.randomUUID(),
      name: s.name,
      species: s.key as Species,
      happiness: 75,
      fullness: 65,
      energy: 80,
      affection: 60,
      activity: "idle",
      adopted_at: new Date().toISOString(),
      updated_at: new Date(0).toISOString(),
    });
    message = `${s.name} found a forever home!`;
  } else if (input.kind === "care") {
    const i = w.pets.findIndex((p) => p.id === input.pet);
    if (i < 0) throw new Error("Pet not found");
    w.pets[i] = care(w.pets[i], input.action as Action);
    message = `${w.pets[i].name} just got a little ${input.action}!`;
    const today = w.events.filter(
      (e) =>
        e.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10),
    ).length;
    if (today < 30) w.treats += 2;
    if (input.action === "cuddle" && !w.achievements.includes("First Cuddle"))
      w.achievements.push("First Cuddle");
    if (input.action === "dance" && !w.achievements.includes("Music Lovers"))
      w.achievements.push("Music Lovers");
  } else if (input.kind === "rename") {
    const name = z.string().trim().min(1).max(24).parse(input.name);
    const p = w.pets.find((p) => p.id === input.pet);
    if (p) p.name = name;
  } else if (input.kind === "letter") {
    const l = letterSchema.parse(input);
    w.letters.unshift({
      ...l,
      id: crypto.randomUUID(),
      sender: "you",
      read: false,
      favorite: false,
      created_at: new Date().toISOString(),
    });
    message = "A little love, sealed and delivered.";
    if (!w.achievements.includes("First Letter"))
      w.achievements.push("First Letter");
  } else if (input.kind === "letter-state") {
    const l = w.letters.find((l) => l.id === input.id);
    if (l) {
      if (input.favorite !== undefined) l.favorite = !!input.favorite;
      if (input.read) l.read = true;
    }
  } else if (input.kind === "decorate") {
    const item = catalog.find((i) => i.id === input.item);
    if (!item) throw new Error("Unknown decoration");
    if (!w.inventory.includes(item.id)) {
      if (w.treats < item.cost)
        throw new Error("A few more Love Treats and it is yours.");
      w.treats -= item.cost;
      w.inventory.push(item.id);
    }
    w.room[item.slot] = item.id;
    message = "A little more cozy.";
    if (!w.achievements.includes("Cozy Home")) w.achievements.push("Cozy Home");
  } else if (input.kind === "favorite-song") {
    const song = z.enum(["morning", "rain", "moon"]).parse(input.song);
    w.favoriteSongs = w.favoriteSongs || [];
    w.favoriteSongs = w.favoriteSongs.includes(song)
      ? w.favoriteSongs.filter((s) => s !== song)
      : [...w.favoriteSongs, song];
  } else if (input.kind === "song") {
    w.song = z.string().parse(input.song);
  } else if (input.kind === "game") {
    const last = w.events.find((e) => e.message === "A playful little break.");
    if (last && Date.now() - Date.parse(last.created_at) < 60000)
      throw new Error(
        "Play for fun! Another participation gift is available in a minute.",
      );
    if (
      w.events.filter(
        (e) =>
          e.message === "A playful little break." &&
          e.created_at.slice(0, 10) === new Date().toISOString().slice(0, 10),
      ).length >= 10
    )
      throw new Error(
        "All of today’s little gifts are collected. Keep playing for fun!",
      );
    w.treats += 3;
    message = "A playful little break.";
  } else if (input.kind === "settings") {
    w.name = z.string().trim().min(1).max(50).parse(input.name);
    w.greeting = z.string().trim().min(1).max(160).parse(input.greeting);
    w.surprise = z
      .string()
      .trim()
      .min(1)
      .max(300)
      .parse(
        input.surprise ||
          w.surprise ||
          "You make ordinary days feel like home.",
      );
  }
  if (w.pets.length === 4 && !w.achievements.includes("Happy Little Family"))
    w.achievements.push("Happy Little Family");
  if (message)
    w.events.unshift({ id, message, created_at: new Date().toISOString() });
  if (
    w.events.filter((e) => e.message.includes("just got a little")).length >=
      50 &&
    !w.achievements.includes("Best Pet Parents")
  )
    w.achievements.push("Best Pet Parents");
  w.events = w.events.slice(0, 100);
  localStorage.setItem(storageKey, JSON.stringify(w));
  localStorage.setItem(
    "little-paws-receipts",
    JSON.stringify([...receipts(), id].slice(-500)),
  );
  return w;
}
