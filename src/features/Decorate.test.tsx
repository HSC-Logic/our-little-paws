import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, cleanup } from "@testing-library/react";
import { Decorate } from "./Decorate";
import {
  availableRoom,
  christmasEndsAt,
  christmasExpired,
  initialWorld,
} from "../lib/model";
import { command } from "../lib/api";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  localStorage.clear();
});

describe("Christmas collection", () => {
  it("expires exactly after December 31 in Sri Lanka", () => {
    expect(christmasExpired(christmasEndsAt - 1)).toBe(false);
    expect(christmasExpired(christmasEndsAt)).toBe(true);
    expect(christmasExpired(Date.parse("2027-12-01"))).toBe(true);
  });

  it("removes expired room items without changing ownership or ordinary items", () => {
    const room = {
      wall: "christmas-wall",
      rug: "rose",
      bed: "christmas-bed",
      accessory: "christmas-hat",
    };
    expect(availableRoom(room, christmasEndsAt - 1)).toBe(room);
    expect(availableRoom(room, christmasEndsAt)).toEqual({
      wall: "cream",
      rug: "rose",
      bed: "",
      accessory: "",
    });
    expect(room.wall).toBe("christmas-wall");
  });

  it("locks even owned items while the corner stays open across midnight", () => {
    vi.useFakeTimers();
    vi.setSystemTime(christmasEndsAt - 1000);
    const world = initialWorld();
    world.inventory.push("christmas-wall");
    render(<Decorate world={world} act={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Place in home" })).toBeEnabled();
    act(() => vi.advanceTimersByTime(1000));
    expect(
      screen.getAllByRole("button", { name: "Expired & locked" }),
    ).toHaveLength(4);
    for (const button of screen.getAllByRole("button", {
      name: "Expired & locked",
    }))
      expect(button).toBeDisabled();
  });

  it("rejects direct expired purchases and owned-item placement without spending", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(christmasEndsAt);
    const world = initialWorld();
    world.inventory.push("christmas-wall");
    localStorage.setItem("little-paws-world-v1", JSON.stringify(world));
    await expect(
      command({ kind: "decorate", item: "christmas-wall" }),
    ).rejects.toThrow("locked");
    await expect(
      command({ kind: "decorate", item: "christmas-rug" }),
    ).rejects.toThrow("locked");
    expect(JSON.parse(localStorage.getItem("little-paws-world-v1")!)).toEqual(
      world,
    );
  });
});
