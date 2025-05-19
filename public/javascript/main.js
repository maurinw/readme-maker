import { initComponents } from "./components.js";
import { initTheme } from "./theme.js";

const getEl = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();

  const editor = getEl('editor');
  if (!editor) {
    console.log("Editor layout not found");
    return;
  }

  try {
    await initComponents(editor);

    const saveBtn       = getEl('saveReadmeBtn');
    const titleInput    = getEl('readmeTitleInput');
    const readmeIdInput = getEl('readmeIdInput');
    const selectedList  = getEl('selectedList');

    if (!saveBtn || !titleInput || !selectedList) {
      console.warn("Save button, title input, or selected list not found on this page.");
      return;
    }

    saveBtn.addEventListener('click', async () => {
      const title = titleInput.value.trim();
      const readmeId = readmeIdInput?.value || null;

      if (!title) {
        alert("Please enter a title for your readme.");
        titleInput.focus();
        return;
      }

      const components = Array.from(selectedList.querySelectorAll('li.md-json-comp'))
        .map(item => ({
          key: item.dataset.key,
          content: item.dataset.content
        }))
        .filter(comp => comp.key && comp.content !== null);

      if (components.length === 0) {
        alert("Please add at least one component to your readme.");
        return;
      }

      try {
        const response = await fetch('/readme/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, components, readmeId })
        });
        const result = await response.json();

        if (response.ok && result.success) {
          alert(`Readme ${result.updated ? 'updated' : 'saved'} successfully!`);
          if (result.readme?._id) {
            if (readmeIdInput) readmeIdInput.value = result.readme._id;
            titleInput.value = result.readme.title;
            editor.dataset.readmeComponents = JSON.stringify(result.readme.components);
          }
        } else {
          alert(`An error occurred: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error saving readme:', error);
        alert('An error occurred while saving the readme.');
      }
    });

  } catch (error) {
    console.error("Error initializing editor components:", error);
    const previewArea = getEl('previewArea');
    if (previewArea) previewArea.innerHTML = "<p>Error initializing editor features.</p>";
  }
});
