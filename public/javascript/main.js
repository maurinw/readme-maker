import { initComponents } from "./components.js";
import { initTheme } from "./theme.js";

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();

  const editor = document.getElementById('editor');

  if (editor) {
    try {
      await initComponents(editor);

      const saveBtn       = document.getElementById('saveReadmeBtn');
      const titleInput    = document.getElementById('readmeTitleInput');
      const readmeIdInput = document.getElementById('readmeIdInput');
      const selectedList  = document.getElementById('selectedList');

      if (saveBtn && titleInput && selectedList) {
        saveBtn.addEventListener('click', async () => {
          const title = titleInput.value.trim();
          const readmeId = readmeIdInput.value || null; // Get the hidden readme ID

          if (!title) {
            alert("Please enter a title for your readme.");
            titleInput.focus();
            return;
          }

          const components = [];
          const selectedItems = selectedList.querySelectorAll('li.md-json-comp');
          selectedItems.forEach(item => {
            const key = item.getAttribute('data-key');
            const content = item.getAttribute('data-content');
            if (key && content !== null) {
              components.push({ key, content });
            }
          });

          if (components.length === 0) {
            alert("Please add at least one component to your readme.");
            return;
          }

          try {
            const response = await fetch('/readme/save', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ title, components, readmeId })
            });
            const result = await response.json();

            if (response.ok && result.success) {
              alert(`Readme ${result.updated ? 'updated' : 'saved'} successfully!`);
              if (result.readme && result.readme._id) {
                readmeIdInput.value = result.readme._id;
                titleInput.value = result.readme.title;
                // Update the data attribute directly if needed after save
                if (editor) {
                    editor.dataset.readmeComponents = JSON.stringify(result.readme.components);
                }
              }
            } else {
              alert(`An error occurred: ${result.error || 'Unknown error'}`);
            }
          } catch (error) {
            console.error('Error saving readme:', error);
            alert('An error occurred while saving the readme.');
          }
        });
      } else {
         console.warn("Save button, title input, or selected list not found on this page.");
      }

    } catch (error) {
       console.error("Error initializing editor components:", error);
    }
  } else {
     console.log("Editor layout not found on this page, skipping component initialization.");
  }
});