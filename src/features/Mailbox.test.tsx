import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Mailbox } from "./Mailbox";
import { initialWorld } from "../lib/model";

afterEach(cleanup);

it("offers occasions and sends a letter opening after three days", async () => {
  const user = userEvent.setup();
  const act = vi.fn().mockResolvedValue(true);
  render(<Mailbox world={initialWorld()} act={act} />);
  await user.click(
    screen.getByRole("button", { name: "Write a little letter" }),
  );
  await user.selectOptions(screen.getByLabelText("Occasion"), "birthday");
  await user.selectOptions(
    screen.getByLabelText("When can it open?"),
    "custom",
  );
  expect(
    screen.getByLabelText("Opening date and time (your local time)"),
  ).toBeRequired();
  await user.selectOptions(
    screen.getByLabelText("When can it open?"),
    "three-days",
  );
  await user.type(screen.getByLabelText("Subject"), "Birthday surprise");
  await user.type(screen.getByLabelText("Your words"), "I love you");
  const before = Date.now();
  await user.click(screen.getByRole("button", { name: "Seal with love" }));
  expect(act).toHaveBeenCalledWith(
    expect.objectContaining({ kind: "letter", occasion: "birthday" }),
  );
  const opening = Date.parse(act.mock.calls[0][0].opens_at);
  expect(opening).toBeGreaterThanOrEqual(before + 3 * 86400000);
  expect(opening).toBeLessThanOrEqual(Date.now() + 3 * 86400000);
});

it("keeps scheduled letters closed, including when the server clock says locked", () => {
  const world = initialWorld();
  world.letters = [
    {
      id: "sealed",
      subject: "Not yet",
      body: "Secret words",
      sender: "you",
      recipient: "partner",
      envelope: "rose",
      read: false,
      favorite: false,
      created_at: new Date().toISOString(),
      opens_at: "2000-01-01T00:00:00Z",
      locked: true,
    },
  ];
  render(<Mailbox world={world} act={vi.fn()} />);
  expect(screen.getByRole("button", { name: /Not yet/ })).toBeDisabled();
  expect(screen.queryByText("Secret words")).not.toBeInTheDocument();
});
