import { describe, it, expect, beforeEach } from "vitest";
import { care, initialWorld } from "./model";
import type { Pet } from "./model";
import { command, getWorld } from "./api";
const pet: Pet = {
  id: "p",
  name: "Mochi",
  species: "puppy",
  happiness: 75,
  fullness: 65,
  energy: 80,
  affection: 60,
  activity: "idle",
  adopted_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};
describe("gentle care rules", () => {
  it("feeds within bounds", () =>
    expect(care({ ...pet, fullness: 95 }, "feed").fullness).toBe(100));
  it("builds affection with cuddles", () =>
    expect(care(pet, "cuddle").affection).toBe(72));
  it("spends energy playing", () => expect(care(pet, "play").energy).toBe(68));
  it("rest restores energy", () => expect(care(pet, "sleep").energy).toBe(100));
  it("prevents play without energy", () =>
    expect(() => care({ ...pet, energy: 2 }, "play")).toThrow("rest"));
  it("requires waking before care", () =>
    expect(() => care({ ...pet, activity: "sleep" }, "feed")).toThrow("rest"));
  it("enforces cooldown", () =>
    expect(() =>
      care({ ...pet, updated_at: new Date().toISOString() }, "feed"),
    ).toThrow("pause"));
});
describe("demo persistence", () => {
  beforeEach(() => localStorage.clear());
  it("starts without invented private letters", () =>
    expect(initialWorld().letters).toEqual([]));
  it("adopts and persists one pet per species", async () => {
    await command({ kind: "adopt", species: "puppy" });
    expect((await getWorld()).pets).toHaveLength(1);
    await expect(command({ kind: "adopt", species: "puppy" })).rejects.toThrow(
      "already",
    );
  });
  it("does not duplicate rewards for an idempotency key", async () => {
    await command({ kind: "game", game: "notes" }, "once");
    await command({ kind: "game", game: "notes" }, "once");
    expect((await getWorld()).treats).toBe(33);
  });
  it("validates letter contents", async () => {
    await expect(
      command({
        kind: "letter",
        subject: "",
        body: "",
        recipient: "partner",
        envelope: "rose",
      }),
    ).rejects.toThrow();
  });
  it("uses fixed game rewards and cooldowns", async () => {
    await command({
      kind: "game",
      game: "notes",
      score: 999999,
      reward: 999999,
    });
    expect((await getWorld()).treats).toBe(33);
    await expect(command({ kind: "game", game: "notes" })).rejects.toThrow(
      "minute",
    );
  });
});
