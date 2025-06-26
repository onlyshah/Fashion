console.log('🚀 Testing DFashion Backend...');

// Test basic Node.js functionality
console.log('✅ Node.js is working');
console.log('📍 Current directory:', __dirname);
console.log('🕐 Current time:', new Date().toISOString());

// Test module loading
try {
  const express = require('express');
  console.log('✅ Express loaded successfully');
} catch (error) {
  console.error('❌ Express loading failed:', error.message);
  process.exit(1);
}

try {
  const mongoose = require('mongoose');
  console.log('✅ Mongoose loaded successfully');
} catch (error) {
  console.error('❌ Mongoose loading failed:', error.message);
  process.exit(1);
}

// Test environment variables
require('dotenv').config();
console.log('✅ Environment variables loaded');
console.log('📊 MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/dfashion');
console.log('🔌 Port:', process.env.PORT || 5000);

// Test database connection
async function testDatabase() {
  try {
    const mongoose = require('mongoose');
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dfashion';
    
    console.log('🔌 Attempting to connect to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
    
    // Test basic database operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📂 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
}

// Test file system
const fs = require('fs');
const path = require('path');

console.log('📁 Checking project structure...');

const requiredFiles = [
  'app.js',
  'package.json',
  'routes/recommendations.js',
  'routes/analytics.js',
  'models/Product.js',
  'models/User.js'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
  }
});

// Test simple Express server
async function testExpressServer() {
  try {
    const express = require('express');
    const app = express();
    
    app.get('/test', (req, res) => {
      res.json({ success: true, message: 'Server is working!' });
    });
    
    const server = app.listen(5001, () => {
      console.log('✅ Test Express server started on port 5001');
      server.close(() => {
        console.log('✅ Test Express server stopped');
      });
    });
    
  } catch (error) {
    console.error('❌ Express server test failed:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('\n🧪 Running comprehensive backend tests...\n');
  
  await testDatabase();
  await testExpressServer();
  
  console.log('\n🎉 Backend test completed!');
  console.log('\n📋 Next steps:');
  console.log('1. If MongoDB connection failed, make sure MongoDB is running');
  console.log('2. If files are missing, check the project structure');
  console.log('3. Try running: node app.js');
  console.log('4. Check if server starts on http://localhost:5000');
}

runTests().catch(console.error);
