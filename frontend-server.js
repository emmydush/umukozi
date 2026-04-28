const express = require('express');
const path = require('path');
const app = express();
const PORT = 8000;

// Serve static files
app.use(express.static(__dirname));

// Serve the main HTML file for all routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌐 Frontend server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
});
