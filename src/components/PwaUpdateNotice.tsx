import { RefreshCw } from "lucide-react";
import { usePWA } from "../lib/pwa";
export function PwaUpdateNotice() {
  const { needsRefresh, updateApp } = usePWA();
  if (!needsRefresh) return null;
  return (
    <aside className="pwa-update-notice" role="status">
      <RefreshCw size={19} />
      <div>
        <strong>A fresh little update is ready</strong>
        <p>Save any edits, then reload to update.</p>
      </div>
      <button
        className="secondary"
        type="button"
        onClick={() => void updateApp?.()}
      >
        Update
      </button>
    </aside>
  );
}
