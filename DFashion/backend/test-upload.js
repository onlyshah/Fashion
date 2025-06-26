const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Test script to verify upload system
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test upload routes
const uploadRoutes = require('./routes/upload');
app.use('/api/v1/upload', uploadRoutes);

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Upload system test server is running',
    endpoints: [
      'POST /api/v1/upload/image - Upload single image',
      'POST /api/v1/upload/multiple - Upload multiple images',
      'POST /api/v1/upload/product-images - Upload product images (requires auth)',
      'POST /api/v1/upload/avatar - Upload user avatar (requires auth)',
      'POST /api/v1/upload/post-media - Upload post media (requires auth)',
      'POST /api/v1/upload/story-media - Upload story media (requires auth)'
    ],
    uploadDirectory: path.join(__dirname, 'uploads'),
    staticUrl: '/uploads'
  });
});

// Mock auth middleware for testing
app.use((req, res, next) => {
  // Add mock user for testing protected routes
  req.user = {
    _id: 'test-user-id',
    username: 'testuser',
    role: 'vendor'
  };
  next();
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Upload error:', error);
  res.status(500).json({
    success: false,
    message: 'Upload failed',
    error: error.message
  });
});

// Check upload directories
const uploadDir = './uploads';
const subdirs = ['products', 'users', 'posts', 'stories', 'temp'];

console.log('Checking upload directories...');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✓ Created main upload directory');
}

subdirs.forEach(subdir => {
  const dirPath = path.join(uploadDir, subdir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ Created ${subdir} directory`);
  } else {
    console.log(`✓ ${subdir} directory exists`);
  }
});

const PORT = process.env.UPLOAD_TEST_PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n🚀 Upload test server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${path.resolve(uploadDir)}`);
  console.log(`🌐 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`📤 Upload endpoints available at: http://localhost:${PORT}/api/v1/upload/`);
  console.log('\nTo test uploads:');
  console.log('1. Use Postman or curl to test endpoints');
  console.log('2. Check uploaded files in the uploads directory');
  console.log('3. Access uploaded files via /uploads/<subdir>/<filename>');
  console.log('\nExample curl command:');
  console.log(`curl -X POST -F "image=@test-image.jpg" http://localhost:${PORT}/api/v1/upload/image`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down upload test server...');
  process.exit(0);
});

module.exports = app;
