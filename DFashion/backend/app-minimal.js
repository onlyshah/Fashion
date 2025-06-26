console.log('🚀 Starting DFashion Backend (Minimal)...');

const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('✅ All modules loaded successfully');

const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const allowedOrigins = [
    'http://localhost:4200',
    'http://localhost:8100',
    'http://localhost:5000',
    'capacitor://localhost',
    'ionic://localhost',
    'https://onlyshah.github.io'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) {
            return callback(null, true);
        }
        if (origin.startsWith('file://')) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        console.log('CORS: Allowing origin:', origin);
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📡 ${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Basic API Routes
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'DFashion Backend is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'DFashion API Server Running',
        database: 'Not connected (minimal mode)'
    });
});

// Mock Auth Routes for testing
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    // Mock authentication - in real app this would check database
    if (email && password) {
        const mockUser = {
            id: '1',
            email: email,
            username: email.split('@')[0],
            role: 'user',
            firstName: 'Test',
            lastName: 'User'
        };

        const mockToken = 'mock-jwt-token-' + Date.now();

        res.json({
            success: true,
            message: 'Login successful',
            user: mockUser,
            token: mockToken
        });
    } else {
        res.status(400).json({
            success: false,
            message: 'Email and password are required'
        });
    }
});

app.post('/api/auth/register', (req, res) => {
    const { email, password, username, firstName, lastName } = req.body;

    // Mock registration - in real app this would save to database
    if (email && password && username) {
        const mockUser = {
            id: Date.now().toString(),
            email: email,
            username: username,
            role: 'user',
            firstName: firstName || 'New',
            lastName: lastName || 'User'
        };

        const mockToken = 'mock-jwt-token-' + Date.now();

        res.json({
            success: true,
            message: 'Registration successful',
            user: mockUser,
            token: mockToken
        });
    } else {
        res.status(400).json({
            success: false,
            message: 'Email, password, and username are required'
        });
    }
});

app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const mockUser = {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            role: 'user',
            firstName: 'Test',
            lastName: 'User'
        };

        res.json({
            success: true,
            user: mockUser
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Start server
const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 DFashion Backend Server Running!');
    console.log('========================================');
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Test Endpoint: http://localhost:${PORT}/api/test`);
    console.log('========================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

module.exports = app;
