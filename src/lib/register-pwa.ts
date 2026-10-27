import { registerSW } from "virtual:pwa-register";
import { usePWA } from "./pwa";
export function registerPWA() {
  if (!("serviceWorker" in navigator)) {
    usePWA.setState({
      registrationError:
        "Offline installation is not supported by this browser.",
    });
    return;
  }
  const update = registerSW({
    immediate: true,
    onNeedRefresh() {
      usePWA.setState({ needsRefresh: true });
    },
    onOfflineReady() {
      usePWA.setState({ offlineReady: true, registrationError: "" });
    },
    onRegisterError() {
      usePWA.setState({
        registrationError:
          "Offline files could not be prepared. Reconnect and reopen the app to retry.",
      });
    },
    onRegisteredSW(_url, registration) {
      if (registration) {
        const refresh = () => {
          if (navigator.onLine && document.visibilityState === "visible")
            void registration.update().catch(() => {});
        };
        document.addEventListener("visibilitychange", refresh);
        window.addEventListener("online", refresh);
      }
    },
  });
  usePWA.setState({
    updateApp: async () => {
      try {
        await update(true);
      } catch {
        usePWA.setState({
          registrationError:
            "The update could not finish. Reconnect and try again.",
        });
      }
    },
  });
}
