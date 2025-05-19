const getEl = (id) => document.getElementById(id);

export async function initComponents(editorElement) {
  const availableList = getEl("availableList");
  const selectedList  = getEl("selectedList");
  const textarea      = getEl("editorTextarea");
  const preview       = getEl("previewArea");

  if (!availableList || !selectedList || !textarea || !preview) {
    console.error("One or more critical editor elements are missing.");
    if (preview) preview.innerHTML = "<p>Editor elements missing. Cannot initialize.</p>";
    return;
  }

  let activeItem = null;
  let dragSrcEl  = null;

  try {
    const response = await fetch("/resources/components.json");
    if (!response.ok) throw new Error(`Failed to fetch components: ${response.statusText}`);
    const componentsData = await response.json();

    let savedComponents = [];
    if (editorElement?.dataset.readmeComponents) {
        try {
            savedComponents = JSON.parse(editorElement.dataset.readmeComponents);
        } catch (e) {
            console.error("Failed to parse saved components data:", e);
        }
    }
    const isEditing = savedComponents.length > 0;

    const updatePreview = () => {
      const fullMarkdown = Array.from(selectedList.querySelectorAll(".md-json-comp"))
        .map(item => item.dataset.content)
        .filter(content => content !== null)
        .join("\n\n");
      preview.innerHTML = marked.parse(fullMarkdown.trim());
    };

    const updateActiveComponentContent = () => {
      if (activeItem) {
        activeItem.dataset.content = textarea.value;
        updatePreview();
      }
    };

    textarea.addEventListener("input", updateActiveComponentContent);

    const createComponentListItem = (key, content, isSelectedListItem) => {
      const li = document.createElement("li");
      li.className = "button primary-button md-json-comp";
      li.dataset.key = key;
      li.textContent = key;
      li.draggable = true;

      li.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", key);
        e.dataTransfer.effectAllowed = "move";
        li.classList.add("dragging");
        dragSrcEl = li;
      });
      li.addEventListener("dragend", () => {
        li.classList.remove("dragging");
      });

      if (isSelectedListItem) {
        li.dataset.content = content;

        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.className = "delete-button";
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          const currentKey = li.dataset.key;
          const wasActive = activeItem === li;

          if (!availableList.querySelector(`[data-key="${currentKey}"]`)) {
            availableList.appendChild(createComponentListItem(currentKey, componentsData[currentKey], false));
          }
          selectedList.removeChild(li);

          if (wasActive) {
            textarea.value = "";
            activeItem = null;
            selectedList.firstChild?.click(); // Activate next if available
          }
          updatePreview();
        };
        li.appendChild(deleteBtn);

        li.addEventListener("click", () => {
          updateActiveComponentContent(); // Save current before switching
          activeItem?.classList.remove("active");
          activeItem = li;
          li.classList.add("active");
          textarea.value = li.dataset.content;
        });
      } else { // Item for availableList
        li.addEventListener("click", () => {
          availableList.removeChild(li);
          const newItem = createComponentListItem(key, componentsData[key], true);
          selectedList.appendChild(newItem);
          newItem.click();
        });
      }
      return li;
    };

    // Initialize lists
    [availableList, selectedList].forEach(list => list.innerHTML = '');
    textarea.value = '';
    activeItem = null;

    const allKeys = Object.keys(componentsData);
    if (isEditing) {
      const selectedKeys = new Set();
      savedComponents.forEach(comp => {
        selectedList.appendChild(createComponentListItem(comp.key, comp.content, true));
        selectedKeys.add(comp.key);
      });
      allKeys.forEach(key => {
        if (!selectedKeys.has(key)) {
          availableList.appendChild(createComponentListItem(key, componentsData[key], false));
        }
      });
      selectedList.firstChild?.click();
    } else {
      allKeys.forEach(key => {
        availableList.appendChild(createComponentListItem(key, componentsData[key], false));
      });
      availableList.querySelector('[data-key="Title"]')?.click();
    }

    // Drag and Drop for reordering/adding to selectedList
    selectedList.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    selectedList.addEventListener("drop", (e) => {
      e.preventDefault();
      const targetItem = e.target.closest(".md-json-comp");

      if (dragSrcEl && dragSrcEl.parentNode === selectedList) { // Reordering within selectedList
        if (targetItem && targetItem !== dragSrcEl) {
          const rect = targetItem.getBoundingClientRect();
          const offset = e.clientY - rect.top;
          const insertBefore = offset < rect.height / 2 ? targetItem : targetItem.nextSibling;
          selectedList.insertBefore(dragSrcEl, insertBefore);
        }
      } else { // Dropping from availableList or other source
        const key = e.dataTransfer.getData("text/plain");
        const itemFromAvailable = availableList.querySelector(`[data-key="${key}"]`);
        if (itemFromAvailable) {
          availableList.removeChild(itemFromAvailable);
          const newItem = createComponentListItem(key, componentsData[key], true);
          if (targetItem) { // Dropped onto an existing selected item
            const rect = targetItem.getBoundingClientRect();
            const offset = e.clientY - rect.top;
            const insertBefore = offset < rect.height / 2 ? targetItem : targetItem.nextSibling;
            selectedList.insertBefore(newItem, insertBefore);
          } else { // Dropped onto empty space in selectedList
            selectedList.appendChild(newItem);
          }
          newItem.click(); // Activate and update preview
        }
      }
      if (dragSrcEl) dragSrcEl.classList.remove("dragging"); // Ensure dragging class is removed
      dragSrcEl = null; // Reset drag source always
      updatePreview(); // Ensure preview is updated after any drop
    });

    updatePreview(); // Initial preview render

  } catch (error) {
    console.error("Error initializing components:", error);
    if (preview) preview.innerHTML = "<p>Error initializing editor components.</p>";
    if (textarea) textarea.value = "Error loading editor.";
    [availableList, selectedList].forEach(list => { if (list) list.innerHTML = ''; });
  }
}
