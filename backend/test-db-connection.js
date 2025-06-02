// backend/test-db-connection.js
const mongoose = require('mongoose');

// MongoDB connection string - REPLACE WITH YOUR ACTUAL CONNECTION STRING
const MONGO_URI = 'mongodb+srv://jethreswar_98:jetRACEwAr7*98@mernapp.jxskwpb.mongodb.net/?retryWrites=true&w=majority&appName=MERNapp';

async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connection successful!');

        // Check if workouts collection exists
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));

        // Count documents in workouts collection
        const Workout = mongoose.model('Workout', new mongoose.Schema({}), 'workouts');
        const count = await Workout.countDocuments();
        console.log(`There are ${count} workouts in the database`);

        await mongoose.connection.close();
        console.log('Connection closed');
    } catch (error) {
        console.error('❌ Connection error:', error);
    } finally {
        process.exit();
    }
}

testConnection();