export async function initComponents(editorElement) {
  try {
    const response       = await fetch("/resources/components.json");
    const componentsData = await response.json();

    const availableList = document.getElementById("availableList");
    const selectedList  = document.getElementById("selectedList");
    const textarea      = document.getElementById("editorTextarea");
    const preview       = document.getElementById("previewArea");

    let activeItem      = null;
    let dragSrcEl       = null;
    let savedComponents = [];
    if (editorElement && editorElement.dataset.readmeComponents) {
        try {
            savedComponents = JSON.parse(editorElement.dataset.readmeComponents);
        } catch (e) {
            console.error("Failed to parse saved components data:", e);
            savedComponents = [];
        }
    }
    const isEditing = savedComponents.length > 0;

    const updatePreview = () => {
      let fullMarkdown = "";
      selectedList.querySelectorAll(".md-json-comp").forEach((item) => {
          const content = item.getAttribute("data-content");
          if (content !== null) {
              fullMarkdown += content + "\n\n";
          }
      });

      preview.innerHTML = marked.parse(fullMarkdown.trim());
      window.fullMarkdown = fullMarkdown.trim();
    };

    const updateActiveComponent = () => {
      if (activeItem) {
        activeItem.setAttribute("data-content", textarea.value);
        updatePreview();
      }
    };

    textarea.addEventListener("input", updateActiveComponent);

    const addDragHandlers = (item) => {
        item.setAttribute("draggable", "true");
        item.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", item.getAttribute("data-key"));
            e.dataTransfer.effectAllowed = "move";
            item.classList.add("dragging");
            dragSrcEl = item; // Track the source element
        });
        item.addEventListener("dragend", () => {
            item.classList.remove("dragging");
            dragSrcEl = null; // Clear tracked source
        });
    };


    const animateListReorder = (domUpdateCallback) => {
      domUpdateCallback();
    };

    const createComponentListItem = (key, content, isSelected) => {
        const li = document.createElement("li");
        li.className = "button primary-button md-json-comp";
        li.setAttribute("data-key", key);
        li.textContent = key;
        addDragHandlers(li);

        if (isSelected) {
            li.setAttribute("data-content", content);

            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteBtn.className = "delete-button";
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                const currentKey = li.getAttribute("data-key");
                const wasActive = activeItem === li;

                // Create corresponding item for available list
                const availableItem = createComponentListItem(currentKey, componentsData[currentKey], false);
                 if (!availableList.querySelector(`[data-key="${currentKey}"]`)) {
                    availableList.appendChild(availableItem);
                 }

                selectedList.removeChild(li);

                if (wasActive) {
                    textarea.value = "";
                    activeItem = null;
                    const nextItem = selectedList.firstChild;
                    if(nextItem) {
                        nextItem.click();
                    }
                }
                updatePreview();
            });
            li.appendChild(deleteBtn);

            li.addEventListener("click", () => {
                updateActiveComponent(); // Save changes to previous active item first
                if (activeItem) activeItem.classList.remove("active");
                activeItem = li;
                li.classList.add("active");
                textarea.value = li.getAttribute("data-content");
            });

        } else { // Item for Available List
            li.addEventListener("click", () => {
                if (availableList.contains(li)) {
                    availableList.removeChild(li);
                    const newItem = createComponentListItem(key, componentsData[key], true);
                    selectedList.appendChild(newItem);
                     // Activate the newly added item
                    newItem.click();
                    updatePreview();
                }
            });
        }
        return li;
    };

    availableList.innerHTML = ''; // Clear lists before populating
    selectedList.innerHTML = '';
    activeItem = null;
    textarea.value = ''; // Clear textarea initially

    const allKeys = Object.keys(componentsData);
    const selectedKeys = new Set(savedComponents.map(comp => comp.key));

    if (isEditing) {
        // Populate selectedList based on savedComponents array order and content
        savedComponents.forEach(comp => {
            const item = createComponentListItem(comp.key, comp.content, true);
            selectedList.appendChild(item);
        });
        // Populate availableList with keys NOT in selectedKeys
        allKeys.forEach(key => {
            if (!selectedKeys.has(key)) {
                 const item = createComponentListItem(key, componentsData[key], false);
                 availableList.appendChild(item);
            }
        });
        // Activate the first selected item
        if (selectedList.firstChild) {
            selectedList.firstChild.click();
        }

    } else {
        allKeys.forEach(key => {
             const item = createComponentListItem(key, componentsData[key], false);
             availableList.appendChild(item);
        });
        const titleItemAvailable = availableList.querySelector('[data-key="Title"]');
        if (titleItemAvailable) {
            titleItemAvailable.click();
        }
    }

    // Drag and Drop for reordering selectedList
    selectedList.addEventListener("dragover", (e) => {
        e.preventDefault(); // Necessary to allow drop
        e.dataTransfer.dropEffect = "move";
        const target = e.target.closest(".md-json-comp");
    });

    selectedList.addEventListener("drop", (e) => {
      e.preventDefault();
      const target = e.target.closest(".md-json-comp");

      if (dragSrcEl && dragSrcEl.parentNode === selectedList) { // Reordering selected items
        if (target && target !== dragSrcEl) {
          animateListReorder(() => {
            const rect = target.getBoundingClientRect();
            const offset = e.clientY - rect.top;
            if (offset > rect.height / 2) {
              target.parentNode.insertBefore(dragSrcEl, target.nextSibling);
            } else {
              target.parentNode.insertBefore(dragSrcEl, target);
            }
            updatePreview();
          });
        }
      } else { // Dropping from availableList
        const key = e.dataTransfer.getData("text/plain");
        const itemFromAvailable = availableList.querySelector(`[data-key="${key}"]`);
        if (itemFromAvailable) {
            availableList.removeChild(itemFromAvailable);
            const newItem = createComponentListItem(key, componentsData[key], true);

            if (target) { // Dropped onto an existing selected item
                const rect = target.getBoundingClientRect();
                const offset = e.clientY - rect.top;
                 if (offset > rect.height / 2) {
                     target.parentNode.insertBefore(newItem, target.nextSibling);
                 } else {
                     target.parentNode.insertBefore(newItem, target);
                 }
            } else { // Dropped onto empty space in selectedList
                 selectedList.appendChild(newItem);
            }
            newItem.click(); // Activate the new item
            updatePreview();
        }
      }
      dragSrcEl = null; // Reset drag source always
    });


    updatePreview(); // Initial preview render based on loaded state
  } catch (error) {
    console.error("Error initializing components:", error);
     const preview       = document.getElementById("previewArea");
     if(preview) preview.innerHTML = "<p>Error initializing editor components.</p>";
     textarea.value = "Error loading editor.";
     availableList.innerHTML = '';
     selectedList.innerHTML = '';
  }
}