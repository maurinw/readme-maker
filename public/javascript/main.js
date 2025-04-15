import { initComponents } from "./components.js";
import { initTheme } from "./theme.js";

document.addEventListener("DOMContentLoaded", async () => {
  await initComponents();
  initTheme();

  const saveBtn = document.getElementById('saveReadmeBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const title = prompt("Enter a title for your readme:");
      if (!title) return;

      // Use the raw markdown (with markdown formatting like "## Test")
      const content = window.fullMarkdown || document.getElementById('previewArea').innerText;

      try {
        const response = await fetch('/readme/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title, content })
        });
        const result = await response.json();
        if (result.success) {
          alert('Readme saved successfully!');
        } else {
          alert('An error occurred while saving the readme.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving the readme.');
      }
    });
  }
});