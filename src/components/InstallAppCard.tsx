import { Download, Check, Smartphone, RefreshCw } from "lucide-react";
import { usePWA, isAppleMobileDevice } from "../lib/pwa";
export function InstallAppCard() {
  const {
    promptEvent,
    installed,
    installing,
    message,
    offlineReady,
    registrationError,
    needsRefresh,
    updateApp,
    install,
  } = usePWA();
  return (
    <section className="install-app-card" aria-labelledby="install-app-title">
      <div className="install-card-title">
        <span className="install-app-icon">
          <Smartphone size={22} />
        </span>
        <div>
          <h3 id="install-app-title">A little home on your home screen</h3>
          <p>Keep your little world just a tap away.</p>
        </div>
      </div>
      {installed ? (
        <p className="install-state">
          <Check size={16} />
          This app is installed.
        </p>
      ) : promptEvent ? (
        <button
          className="primary"
          type="button"
          disabled={installing}
          onClick={() => void install()}
        >
          <Download size={17} />
          {installing ? "Opening installer…" : "Install Little Paws"}
        </button>
      ) : isAppleMobileDevice() ? (
        <p>
          On iPhone or iPad, open this page in Safari, tap{" "}
          <strong>Share</strong>, then <strong>Add to Home Screen</strong>. Turn
          on <strong>Open as Web App</strong> if shown.
        </p>
      ) : (
        <p>
          Open your browser’s menu and choose <strong>Install app</strong> or{" "}
          <strong>Add to Home Screen</strong>. Supported browsers also show an
          install icon in the address bar.
        </p>
      )}
      {message && <p role="status">{message}</p>}
      <p className="offline-install-note">
        {offlineReady
          ? "Your app and public artwork are ready for offline use."
          : "Offline files are prepared after your first online visit."}{" "}
        Shared pet care, sign-in, and letters still need a connection.
      </p>
      {registrationError && <p role="status">{registrationError}</p>}
      {needsRefresh && (
        <div className="pwa-update-inline">
          <p>A new version is ready. Save any edits before reloading.</p>
          <button
            className="secondary"
            type="button"
            onClick={() => void updateApp?.()}
          >
            <RefreshCw size={16} />
            Update and reload
          </button>
        </div>
      )}
    </section>
  );
}
