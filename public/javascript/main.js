import { initComponents } from "./components.js";
import { initTheme } from "./theme.js";
import { initNavbar }     from "./navbar.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Pass the editor layout element to initComponents
  const editorLayout = document.getElementById('editorLayout');
  await initComponents(editorLayout);
  initNavbar();
  initTheme();

  const saveBtn = document.getElementById('saveReadmeBtn');
  const titleInput = document.getElementById('readmeTitleInput');
  const readmeIdInput = document.getElementById('readmeIdInput');
  const selectedList = document.getElementById('selectedList'); // Get selected list reference

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
          if (key && content !== null) { // Ensure both key and content exist
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
          // Send components array instead of content string
          body: JSON.stringify({ title, components, readmeId })
        });
        const result = await response.json();

        if (response.ok && result.success) {
           alert(`Readme ${result.updated ? 'updated' : 'saved'} successfully!`);
           if(result.readme && result.readme._id) {
               readmeIdInput.value = result.readme._id;
               titleInput.value = result.readme.title;
               editorLayout.dataset.readmeComponents = JSON.stringify(result.readme.components);
           }
        } else {
          alert(`An error occurred: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving the readme.');
      }
    });
  }
});