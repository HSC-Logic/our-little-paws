import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Moments } from "./Moments";
import { initialWorld } from "../lib/model";

afterEach(cleanup);

it("keeps a failed note, clears a saved note, and disables an empty jar draw", async () => {
  const user = userEvent.setup();
  const save = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  render(<Moments world={initialWorld()} act={save} />);
  expect(screen.getByRole("button", { name: "Draw a memory" })).toBeDisabled();
  const note = screen.getByLabelText("A moment worth keeping");
  await user.type(note, "Our picnic");
  await user.click(screen.getByRole("button", { name: "Tuck into our jar" }));
  expect(note).toHaveValue("Our picnic");
  await user.click(screen.getByRole("button", { name: "Tuck into our jar" }));
  expect(note).toHaveValue("");
  expect(save).toHaveBeenCalledWith({ kind: "memory", body: "Our picnic" });
});

it("draws a saved memory with preserved text", async () => {
  const world = initialWorld();
  world.memories = [
    {
      id: "one",
      body: "A rainy day together",
      author: "you",
      created_at: "2026-11-08T10:00:00Z",
    },
  ];
  render(<Moments world={world} act={vi.fn()} />);
  await userEvent.click(screen.getByRole("button", { name: "Draw a memory" }));
  expect(screen.getByRole("status")).toHaveTextContent("A rainy day together");
});
