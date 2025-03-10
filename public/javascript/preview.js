document.addEventListener('DOMContentLoaded', function() {
    const editor = document.querySelector('textarea');
    const previewContainer = document.querySelector('.card-body .border');
  
    const converter = new showdown.Converter();

    function updatePreview() {
      const markdownText = editor.value;
      const html = converter.makeHtml(markdownText);
      previewContainer.innerHTML = html;
    }
  
    editor.addEventListener('input', updatePreview);
  
    updatePreview();
  });
  