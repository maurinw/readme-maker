// Inside /server.js

const path = require("path");
const express = require("express");
const fs = require('fs');
const app = express();

// Middleware to parse JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set view engine
app.set("view engine", "ejs");

// Route to render index.ejs
app.get("/", (req, res) => {
  res.render("index");
});

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// Serve Bootstrap files from node_modules
app.use(
  "/bootstrap",
  express.static(path.join(__dirname, "node_modules", "bootstrap", "dist"))
);

// Serve Showdown from node_modules
app.use(
  "/showdown",
  express.static(path.join(__dirname, "node_modules", "showdown", "dist"))
);

// POST route to save markdown file and send it as a download
app.post('/save-markdown', (req, res) => {
  const markdownContent = req.body.markdown;
  
  // Write markdown content to a file
  const filePath = 'output.md';
  fs.writeFileSync(filePath, markdownContent);

  // Send the markdown file as a downloadable response
  res.download(filePath, 'your-file.md', (err) => {
    if (err) {
      console.error("Error during file download:", err);
    }
    fs.unlinkSync(filePath); 
  });
});

// Start the server
app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});
