import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/todo-react/service-worker.js")
      .then((registration) => {
        console.log("Service Worker registered! Scope: ", registration.scope);
      })
      .catch((err) => {
        console.log("Service Worker registration failed: ", err);
      });
  });
}