document.addEventListener('DOMContentLoaded', () => {

  const editor           = document.getElementById('editorTextarea') || document.querySelector('textarea');
  const previewContainer = document.getElementById('previewArea')    || document.querySelector('.card-body .border');
  const converter        = new showdown.Converter();

  function updatePreview() {
    previewContainer.innerHTML = converter.makeHtml(editor.value);
  }

  editor.addEventListener('input', updatePreview);
  updatePreview();

  fetch('../resources/components.json')
    .then(response => response.json())
    .then(componentsData => {
      const listItems = document.querySelectorAll('#componentList .list-group-item');
      listItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', item.getAttribute('data-key'));
        });
      });

      editor.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      });

      editor.addEventListener('drop', (e) => {
        e.preventDefault();
        const key = e.dataTransfer.getData('text/plain');
        if (componentsData[key]) {
          if (editor.value.trim()) {
            editor.value += "\n\n" + componentsData[key];
          } else {
            editor.value = componentsData[key];
          }
          updatePreview();
        }
      });
    })
    .catch(error => console.error('Error loading components:', error));
});
