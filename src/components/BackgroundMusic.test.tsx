import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MemoryRouter, Link } from "react-router-dom";
import { BackgroundMusic } from "./BackgroundMusic";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("retries blocked autoplay, mutes, and pauses for the Music Room", async () => {
  const play = vi
    .spyOn(HTMLMediaElement.prototype, "play")
    .mockRejectedValueOnce(new Error("Autoplay blocked"))
    .mockResolvedValue();
  const pause = vi
    .spyOn(HTMLMediaElement.prototype, "pause")
    .mockImplementation(() => {});
  render(
    <MemoryRouter>
      <BackgroundMusic />
      <Link to="/music">Music room</Link>
    </MemoryRouter>,
  );
  await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
  fireEvent.pointerDown(document);
  await waitFor(() => expect(play).toHaveBeenCalledTimes(2));
  const audio = screen.getByLabelText(
    "Romantic instrumental background music",
  ) as HTMLAudioElement;
  expect(audio.volume).toBe(0.15);
  expect(audio.loop).toBe(true);
  fireEvent.click(
    screen.getByRole("button", { name: "Mute background music" }),
  );
  expect(pause).toHaveBeenCalled();
  const mutedCalls = play.mock.calls.length;
  fireEvent.pointerDown(document);
  expect(play).toHaveBeenCalledTimes(mutedCalls);
  fireEvent.click(
    screen.getByRole("button", { name: "Enable background music" }),
  );
  await waitFor(() => expect(play).toHaveBeenCalledTimes(mutedCalls + 1));
  fireEvent.click(screen.getByRole("link", { name: "Music room" }));
  expect(
    screen.queryByRole("button", { name: "Mute background music" }),
  ).not.toBeInTheDocument();
  const musicRoomCalls = play.mock.calls.length;
  fireEvent.pointerDown(document);
  expect(play).toHaveBeenCalledTimes(musicRoomCalls);
});
