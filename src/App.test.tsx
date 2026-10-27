import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { Adoption, MusicRoom, Mailbox } from "./features/Rooms";
import { initialWorld } from "./lib/model";
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("little rooms", () => {
  it.each([
    "for-you-october-25",
    "for-you-october-11",
    "for-you-july-30",
    "for-you-june-30",
    "for-you-june-3",
    "for-you-may-31",
    "for-you-may-30",
  ])("loads personal recording %s with a saved playlist", (song) => {
    render(
      <MusicRoom
        world={{
          ...initialWorld(),
          song,
          songs: [
            {
              id: "morning",
              title: "Morning",
              artist: "Home",
              mood: "Cozy",
              color: "#f3dfba",
            },
          ],
        }}
        act={vi.fn()}
      />,
    );
    expect(
      (screen.getByLabelText("Our little soundtrack") as HTMLAudioElement).src,
    ).toContain(`/audio/${song}.opus`);
    expect(
      screen.getByRole("button", {
        name: "Favorite You sang for me - October 25",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Favorite You sang for me - October 11",
      }),
    ).toBeInTheDocument();
  });
  it("has four accessible adoption controls", () => {
    render(<Adoption world={initialWorld()} act={vi.fn()} />);
    expect(
      screen.getAllByRole("button", { name: /Bring me home/ }),
    ).toHaveLength(4);
  });
  it("plays only after a gesture, adjusts volume, pauses, and cleans up", async () => {
    const { unmount } = render(
      <MusicRoom world={initialWorld()} act={vi.fn()} />,
    );
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    await screen.findByRole("button", { name: "Pause" });
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    fireEvent.change(screen.getByRole("slider", { name: "Volume" }), {
      target: { value: "0.2" },
    });
    expect(
      (screen.getByLabelText("Our little soundtrack") as HTMLAudioElement)
        .volume,
    ).toBe(0.2);
    fireEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    unmount();
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });
  it("resumes the newly selected melody while playing", async () => {
    const { rerender } = render(
      <MusicRoom world={initialWorld()} act={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    await screen.findByRole("button", { name: "Pause" });
    rerender(
      <MusicRoom world={{ ...initialWorld(), song: "rain" }} act={vi.fn()} />,
    );
    await waitFor(() =>
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2),
    );
    expect(
      (screen.getByLabelText("Our little soundtrack") as HTMLAudioElement).src,
    ).toContain("/audio/rain.wav");
  });
  it("explains rejected audio playback and lets the user retry", async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(
      new Error("Blocked"),
    );
    render(<MusicRoom world={initialWorld()} act={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Playback could not start",
    );
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });
  it("offers compose and private empty state", () => {
    render(<Mailbox world={initialWorld()} act={vi.fn()} />);
    fireEvent.click(
      screen.getByRole("button", { name: /Write a little letter/ }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Your words")).toBeInTheDocument();
  });
});
