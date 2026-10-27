import React from "react";
import ReactDOM from "react-dom/client";
import Root from "./App";
import { setupInstallListeners } from "./lib/pwa";
import { PwaUpdateNotice } from "./components/PwaUpdateNotice";
import "./styles.css";
import "./styles/game-theme.css";
setupInstallListeners();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
    <PwaUpdateNotice />
  </React.StrictMode>,
);
if (import.meta.env.PROD) {
  void import("./lib/register-pwa").then(({ registerPWA }) => registerPWA());
}
