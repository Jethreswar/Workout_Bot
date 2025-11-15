// backend/test-db.js
const mongoose = require('mongoose');
const Workout = require('./models/workoutModel');

// IMPORTANT: Replace with your actual MongoDB connection string
const MONGO_URI = 'mongodb+srv://jethreswar_98:jetRACEwAr7*98@mernapp.jxskwpb.mongodb.net/?retryWrites=true&w=majority&appName=MERNapp';

async function testDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Count existing workouts
        const count = await Workout.countDocuments();
        console.log(`Database has ${count} workouts`);

        // List all workouts
        const workouts = await Workout.find({}).sort({ createdAt: -1 });
        console.log('Current workouts:');
        workouts.forEach(w => {
            console.log(`- ${w._id}: ${w.title} (${w.category})`);
        });

        // Test creating a workout
        console.log('\nCreating test workout...');
        const testWorkout = new Workout({
            title: 'Test Workout ' + new Date().toISOString(),
            reps: 10,
            load: 20,
            category: 'Strength',
            completed: false
        });

        await testWorkout.save();
        console.log('Test workout created with ID:', testWorkout._id);

        // Verify workout was saved
        const saved = await Workout.findById(testWorkout._id);
        if (saved) {
            console.log('✅ Successfully verified workout was saved');
        } else {
            console.log('❌ Failed to verify workout');
        }

    } catch (error) {
        console.error('Database test error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Connection closed');
    }
}

testDatabase();