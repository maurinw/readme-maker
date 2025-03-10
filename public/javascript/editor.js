document.addEventListener('DOMContentLoaded', () => {
  fetch('/resources/components.json')
    .then(response => response.json())
    .then(componentsData => {
      const availableList = document.getElementById('availableList');
      const selectedList = document.getElementById('selectedList');
      const editor = document.getElementById('editorTextarea');
      const preview = document.getElementById('previewArea');
      const converter = new showdown.Converter();
      let activeItem = null;
      
      function updatePreview() {
        let fullMarkdown = '';
        selectedList.querySelectorAll('.list-group-item').forEach(item => {
          const content = item.getAttribute('data-content') || componentsData[item.getAttribute('data-key')];
          fullMarkdown += content + '\n\n';
        });
        preview.innerHTML = converter.makeHtml(fullMarkdown.trim());
      }
      
      function updateActiveComponent() {
        if (activeItem) {
          activeItem.setAttribute('data-content', editor.value);
          updatePreview();
        }
      }
      
      for (const key in componentsData) {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.setAttribute('draggable', 'true');
        li.setAttribute('data-key', key);
        li.textContent = key;
        availableList.appendChild(li);
        addDragHandlers(li);
        li.addEventListener('click', () => {
          if (availableList.contains(li)) {
            availableList.removeChild(li);
            addItemToSelected(li);
            updatePreview();
          }
        });
      }
      
      function addDragHandlers(item) {
        item.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', item.getAttribute('data-key'));
          e.dataTransfer.effectAllowed = 'move';
          item.classList.add('dragging');
        });
        item.addEventListener('dragend', () => {
          item.classList.remove('dragging');
        });
      }
      
      selectedList.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      
      selectedList.addEventListener('drop', (e) => {
        e.preventDefault();
        const key = e.dataTransfer.getData('text/plain');
        const item = availableList.querySelector(`[data-key="${key}"]`);
        if (item) {
          availableList.removeChild(item);
          addItemToSelected(item);
          updatePreview();
        }
      });
      
      let dragSrcEl = null;
      selectedList.addEventListener('dragstart', (e) => {
        dragSrcEl = e.target.closest('.list-group-item');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', dragSrcEl.getAttribute('data-key'));
      });
      selectedList.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      selectedList.addEventListener('drop', (e) => {
        e.preventDefault();
        const target = e.target.closest('.list-group-item');
        if (target && dragSrcEl && target !== dragSrcEl) {
          const rect = target.getBoundingClientRect();
          const offset = e.clientY - rect.top;
          if (offset > rect.height / 2) {
            target.parentNode.insertBefore(dragSrcEl, target.nextSibling);
          } else {
            target.parentNode.insertBefore(dragSrcEl, target);
          }
          updatePreview();
        }
      });
      
      function addItemToSelected(availableItem) {
        const selectedItem = document.createElement('li');
        selectedItem.className = 'list-group-item';
        selectedItem.setAttribute('draggable', 'true');
        const key = availableItem.getAttribute('data-key');
        selectedItem.setAttribute('data-key', key);
        selectedItem.setAttribute('data-content', componentsData[key]);
        selectedItem.textContent = key;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="bi bi-x-circle"></i>';
        deleteBtn.className = 'btn btn-sm btn-danger float-end';
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (activeItem === selectedItem) {
            editor.value = '';
            activeItem = null;
          }
          selectedList.removeChild(selectedItem);
          availableList.appendChild(availableItem);
          availableItem.classList.add('deselected');
          addDragHandlers(availableItem);
          updatePreview();
          selectedItem.classList.remove('active');
        });
        
        selectedItem.appendChild(deleteBtn);
        
        selectedItem.addEventListener('click', () => {
          updateActiveComponent();
          if (activeItem) activeItem.classList.remove('active');
          activeItem = selectedItem;
          selectedItem.classList.add('active');
          editor.value = selectedItem.getAttribute('data-content') || componentsData[key];
        });
        
        addDragHandlers(selectedItem);
        selectedList.appendChild(selectedItem);
        
        if (!activeItem) {
          activeItem = selectedItem;
          selectedItem.classList.add('active');
          editor.value = selectedItem.getAttribute('data-content') || componentsData[key];
        }
      }
      
      
      editor.addEventListener('input', updateActiveComponent);
    })
    .catch(error => console.error('Error loading components:', error));
});
