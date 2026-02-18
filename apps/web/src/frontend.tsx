import { createRoot } from "react-dom/client";
import "./style.css";
import { createServiceRegistry } from "./services";
import { AppProvider } from "./viewmodels";
import { App } from "./views/App";

const registry = createServiceRegistry();

const root = createRoot(document.getElementById("root")!);
root.render(
  <AppProvider registry={registry}>
    <App />
  </AppProvider>
);
