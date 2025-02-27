document.addEventListener("DOMContentLoaded", function () {
    const downloadButton = document.getElementById("download-markdown");
  
    downloadButton.addEventListener("click", function () {
      const markdownEditor = document.getElementById("markdown-editor");
      const markdownContent = markdownEditor.innerText;
      
      if (markdownContent) {
        fetch('/save-markdown', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ markdown: markdownContent })
        })
        .then(response => response.blob())
        .then(blob => {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'your-file.md';
          link.click();
        })
        .catch(error => console.error('Error downloading markdown:', error));
      } else {
        alert('No markdown content to download!');
      }
    });
  });
  