const path = require('path');
const express = require('express');
const fs = require('fs');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

app.listen(4000, () => console.log('Server läuft auf Port 4000'));
