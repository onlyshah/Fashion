console.log('🚀 Starting simple test server...');

const express = require('express');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Simple test server is working!',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Simple server running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 Simple Test Server Running!');
  console.log('========================================');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🌐 Test: http://localhost:${PORT}/api/test`);
  console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
  console.log('========================================');
});
