document.addEventListener("DOMContentLoaded", function () {
  const markdownEditor = document.getElementById("markdown-editor");
  const markdownPreview = document.getElementById("markdown-preview");

  if (typeof showdown !== "undefined") {
    const converter = new showdown.Converter();

    function updatePreview() {
      const markdownText = markdownEditor.value;
      const htmlContent = converter.makeHtml(markdownText);
      markdownPreview.innerHTML = htmlContent;
    }

    markdownEditor.addEventListener("input", updatePreview);

    updatePreview();
  } else {
    console.error("Showdown.js is not loaded.");
  }
});
