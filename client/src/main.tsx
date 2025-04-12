import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AudioProvider } from "./context/AudioContext";

createRoot(document.getElementById("root")!).render(
  <AudioProvider>
    <App />
  </AudioProvider>
);
