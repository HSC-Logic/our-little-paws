import { create } from "zustand";
export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}
interface PwaState {
  promptEvent: InstallPromptEvent | null;
  installed: boolean;
  installing: boolean;
  message: string;
  offlineReady: boolean;
  needsRefresh: boolean;
  registrationError: string;
  updateApp: (() => Promise<void>) | null;
  install: () => Promise<void>;
}
export const usePWA = create<PwaState>((set, get) => ({
  promptEvent: null,
  installed: false,
  installing: false,
  message: "",
  offlineReady: false,
  needsRefresh: false,
  registrationError: "",
  updateApp: null,
  install: async () => {
    const { promptEvent, installing } = get();
    if (!promptEvent || installing) return;
    set({ installing: true, message: "" });
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      set({
        promptEvent: null,
        message:
          choice.outcome === "accepted"
            ? "Installation accepted. Your browser will finish adding the app."
            : "You can install later from your browser menu.",
      });
    } catch {
      set({
        promptEvent: null,
        message:
          "The installer could not open. Use your browser’s install menu instead.",
      });
    } finally {
      set({ installing: false });
    }
  },
}));
export function isAppleMobileDevice() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}
export function setupInstallListeners() {
  const media = window.matchMedia?.("(display-mode: standalone)");
  const checkStandalone = () => {
    const installed = !!(
      media?.matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone
    );
    if (installed)
      usePWA.setState({ installed: true, promptEvent: null, message: "" });
  };
  const beforeInstall = (event: Event) => {
    event.preventDefault();
    usePWA.setState({ promptEvent: event as InstallPromptEvent, message: "" });
  };
  const installed = () =>
    usePWA.setState({
      installed: true,
      promptEvent: null,
      installing: false,
      message: "",
    });
  checkStandalone();
  window.addEventListener("beforeinstallprompt", beforeInstall);
  window.addEventListener("appinstalled", installed);
  media?.addEventListener("change", checkStandalone);
  return () => {
    window.removeEventListener("beforeinstallprompt", beforeInstall);
    window.removeEventListener("appinstalled", installed);
    media?.removeEventListener("change", checkStandalone);
  };
}
