import React from "react";
import ReactDOM from "react-dom/client";
import Root from "./App";
import "./styles.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  addEventListener("load", () => {
    void navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch(() => {
        /* Offline shell is optional; the online application remains available. */
      });
  });
}
