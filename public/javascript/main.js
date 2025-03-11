import { initComponents } from "./components.js";
import { initTheme }      from "./theme.js";

document.addEventListener("DOMContentLoaded", async () => {
  const cmEditor = await initComponents();
  initTheme(cmEditor);
});
