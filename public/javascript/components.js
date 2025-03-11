export async function initComponents() {
  try {
    // Fetch component data from the JSON file
    const response       = await fetch("/resources/components.json");
    const componentsData = await response.json();

    // Get DOM elements
    const availableList  = document.getElementById("availableList");
    const selectedList   = document.getElementById("selectedList");
    const textarea       = document.getElementById("editorTextarea");
    const preview        = document.getElementById("previewArea");
    const converter      = new showdown.Converter();

    let activeItem = null;
    let dragSrcEl  = null;

    // Initialize CodeMirror editor
    const currentTheme =
      document.documentElement.getAttribute("data-bs-theme") === "dark"
        ? "dracula"
        : "eclipse";
    const cmEditor     = CodeMirror.fromTextArea(textarea, {
      mode: "markdown",
      lineWrapping: true,
      theme: currentTheme,
    });

    // Update the preview area by concatenating all markdown content
    const updatePreview = () => {
      let fullMarkdown = "";
      selectedList.querySelectorAll(".list-group-item").forEach((item) => {
        const content =
          item.getAttribute("data-content") ||
          componentsData[item.getAttribute("data-key")];
        fullMarkdown += content + "\n\n";
      });
      preview.innerHTML = converter.makeHtml(fullMarkdown.trim());
    };

    // Update the active component's content based on the CodeMirror editor
    const updateActiveComponent = () => {
      if (activeItem) {
        activeItem.setAttribute("data-content", cmEditor.getValue());
        updatePreview();
      }
    };

    cmEditor.on("change", updateActiveComponent);

    // Add basic drag event handlers to list items
    const addDragHandlers = (item) => {
      item.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", item.getAttribute("data-key"));
        e.dataTransfer.effectAllowed = "move";
        item.classList.add("dragging");
      });
      item.addEventListener("dragend", () => {
        item.classList.remove("dragging");
      });
    };

    // Directly execute DOM update callback without animation
    const animateListReorder = (domUpdateCallback) => {
      domUpdateCallback();
    };

    // Add an item from the available list to the selected list
    const addItemToSelected    = (availableItem) => {
      const selectedItem       = document.createElement("li");
      const key                = availableItem.getAttribute("data-key");
      selectedItem.className   = "list-group-item";

      selectedItem.setAttribute("draggable", "true");
      selectedItem.setAttribute("data-key", key);
      selectedItem.setAttribute("data-content", componentsData[key]);
      selectedItem.textContent = key;

      // Create delete button for the component
      const deleteBtn     = document.createElement("button");
      deleteBtn.innerHTML = '<i class="bi bi-x-circle"></i>';
      deleteBtn.className = "btn btn-sm btn-danger float-end";

      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (activeItem === selectedItem) {
          cmEditor.setValue("");
          activeItem = null;
        }
        selectedList.removeChild(selectedItem);
        availableList.appendChild(availableItem);
        availableItem.classList.add("deselected");
        addDragHandlers(availableItem);
        updatePreview();
        selectedItem.classList.remove("active");
      });

      selectedItem.appendChild(deleteBtn);

      // When the item is clicked, load its content into the editor
      selectedItem.addEventListener("click", () => {
        updateActiveComponent();
        if (activeItem) activeItem.classList.remove("active");
        activeItem = selectedItem;
        selectedItem.classList.add("active");
        cmEditor.setValue(
          selectedItem.getAttribute("data-content") || componentsData[key]
        );
      });

      addDragHandlers(selectedItem);
      selectedList.appendChild(selectedItem);

      if (!activeItem) {
        activeItem = selectedItem;
        selectedItem.classList.add("active");
        cmEditor.setValue(
          selectedItem.getAttribute("data-content") || componentsData[key]
        );
      }
    };

    // Process and display available components
    for (const key in componentsData) {
      const li     = document.createElement("li");
      li.className = "list-group-item";
      li.setAttribute("draggable", "true");
      li.setAttribute("data-key", key);
      li.textContent = key;
      availableList.appendChild(li);
      addDragHandlers(li);
      li.addEventListener("click", () => {
        if (availableList.contains(li)) {
          availableList.removeChild(li);
          addItemToSelected(li);
          updatePreview();
        }
      });
    }

    // Automatically select the "Title" component if it exists
    const titleItem = availableList.querySelector('[data-key="Title"]');
    if (titleItem) {
      availableList.removeChild(titleItem);
      addItemToSelected(titleItem);
      updatePreview();
    }

    // Drag & drop event listeners for reordering within the selected list
    selectedList.addEventListener("dragstart", (e) => {
      dragSrcEl = e.target.closest(".list-group-item");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", dragSrcEl.getAttribute("data-key"));
    });

    selectedList.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });

    selectedList.addEventListener("drop", (e) => {
      e.preventDefault();
      if (dragSrcEl) {
        const target = e.target.closest(".list-group-item");
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
        dragSrcEl = null;
      } else {
        // Handle drops coming from the available list
        const key = e.dataTransfer.getData("text/plain");
        const item = availableList.querySelector(`[data-key="${key}"]`);
        if (item) {
          availableList.removeChild(item);
          addItemToSelected(item);
          updatePreview();
        }
      }
    });

    // Update the preview on initialization
    updatePreview();

    return cmEditor;
  } catch (error) {
    console.error("Error loading components:", error);
  }
}
