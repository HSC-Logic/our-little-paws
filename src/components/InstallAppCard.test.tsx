import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  cleanup,
  waitFor,
} from "@testing-library/react";
import { InstallAppCard } from "./InstallAppCard";
import { PwaUpdateNotice } from "./PwaUpdateNotice";
import { setupInstallListeners, usePWA } from "../lib/pwa";
let dispose: () => void;
beforeEach(() => {
  usePWA.setState({
    promptEvent: null,
    installed: false,
    installing: false,
    message: "",
    offlineReady: false,
    needsRefresh: false,
    registrationError: "",
    updateApp: null,
  });
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  dispose = setupInstallListeners();
});
afterEach(() => {
  dispose();
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function offerInstall(outcome: "accepted" | "dismissed") {
  const event = new Event("beforeinstallprompt", { cancelable: true });
  const prompt = vi.fn().mockResolvedValue(undefined);
  Object.assign(event, {
    prompt,
    userChoice: Promise.resolve({ outcome, platform: "web" }),
  });
  act(() => {
    window.dispatchEvent(event);
  });
  return { event, prompt };
}
describe("PWA installation and updates", () => {
  it("prompts only after a click and confirms installation from the browser event", async () => {
    const { event, prompt } = offerInstall("accepted");
    render(<InstallAppCard />);
    expect(event.defaultPrevented).toBe(true);
    expect(prompt).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: "Install Little Paws" }),
    );
    await waitFor(() => expect(prompt).toHaveBeenCalledOnce());
    expect(usePWA.getState().installed).toBe(false);
    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });
    expect(screen.getByText("This app is installed.")).toBeInTheDocument();
  });
  it("handles dismissal without claiming installation", async () => {
    offerInstall("dismissed");
    render(<InstallAppCard />);
    fireEvent.click(
      screen.getByRole("button", { name: "Install Little Paws" }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent(
      "install later",
    );
    expect(usePWA.getState().installed).toBe(false);
    expect(usePWA.getState().promptEvent).toBeNull();
  });
  it("gives Safari home-screen instructions without an unsupported install button", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
      "Mozilla/5.0 (iPhone)",
    );
    render(<InstallAppCard />);
    expect(screen.getByText("Share")).toBeInTheDocument();
    expect(screen.getByText("Add to Home Screen")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Install Little Paws" }),
    ).not.toBeInTheDocument();
  });
  it("recognizes standalone display mode", () => {
    dispose();
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList);
    dispose = setupInstallListeners();
    render(<InstallAppCard />);
    expect(screen.getByText("This app is installed.")).toBeInTheDocument();
  });
  it("waits for explicit approval before reloading an update", async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    usePWA.setState({ needsRefresh: true, updateApp: update });
    render(<PwaUpdateNotice />);
    expect(update).not.toHaveBeenCalled();
    expect(
      screen.getByText("Save any edits, then reload to update."),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Update" }));
    await waitFor(() => expect(update).toHaveBeenCalledOnce());
  });
});
