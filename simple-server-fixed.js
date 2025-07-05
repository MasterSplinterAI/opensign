const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Simple health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve index.html for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 PDF Signer server running on port ${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'build')}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
}); 