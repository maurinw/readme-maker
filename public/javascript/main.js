import { initComponents } from "./components.js";
import { initTheme } from "./theme.js";

document.addEventListener("DOMContentLoaded", async () => {
  await initComponents();
  initTheme();
});
