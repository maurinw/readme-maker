const path = require("path");
const express = require("express");
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

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

// Start the server
app.listen(4000, () => console.log("Server läuft auf Port 4000"));
