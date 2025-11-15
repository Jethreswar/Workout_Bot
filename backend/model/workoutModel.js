const mongoose = require('mongoose'); // Import mongoose

const Schema = mongoose.Schema; // Initialize mongoose schema

const workoutSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    reps: {
        type: Number,
        required: true
    },
    load: {
        type: Number,
        required: true
    }
}, {timestamps: true}); // Create workout schema

module.exports = mongoose.model('Workout', workoutSchema); // Export the model with schema as 'Workout' and 'workoutSchema' as the schema
