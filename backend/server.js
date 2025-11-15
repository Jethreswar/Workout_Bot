// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const workoutRoutes = require('./routes/workouts');
const chatbotRoutes = require('./routes/chatbot');

// Create express app
const app = express();
const PORT = process.env.PORT || 4000;

// Enhanced middleware for CORS (Cross-Origin Resource Sharing)
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true
}));

// Increase JSON payload size limit
app.use(express.json({ limit: '10mb' }));

// Enhanced logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Monitor response
app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (body) {
        console.log(`[${new Date().toISOString()}] Response for ${req.method} ${req.originalUrl}:`,
            body ? (Array.isArray(body) ? `Array with ${body.length} items` : typeof body) : 'empty');
        return originalJson.call(this, body);
    };
    next();
});

// API routes
app.use('/api/workouts', workoutRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API is working properly' });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Workout Tracker API is running',
        endpoints: [
            { path: '/api/workouts', methods: ['GET', 'POST'] },
            { path: '/api/workouts/:id', methods: ['GET', 'DELETE', 'PATCH'] },
            { path: '/api/chatbot', methods: ['GET', 'POST'] },
            { path: '/api/test', methods: ['GET'] }
        ]
    });
});

// MongoDB connection with retry logic
const connectDB = async () => {
    // IMPORTANT: Replace with your actual MongoDB connection string
    const MONGO_URI = 'mongodb://localhost:27017/workout-tracker';

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected successfully');
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        return false;
    }
};

// Start server with connection retry
const startServer = async () => {
    let connected = await connectDB();

    // Retry connection up to 3 times
    let retries = 0;
    while (!connected && retries < 3) {
        console.log(`Retrying connection (${retries + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        connected = await connectDB();
        retries++;
    }

    if (!connected) {
        console.error('Failed to connect to MongoDB after multiple attempts. Exiting...');
        process.exit(1);
    }

    // Start server
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
};

startServer();