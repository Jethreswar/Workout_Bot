const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workoutSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Please add a workout title']
    },
    reps: {
        type: Number,
        required: [true, 'Please specify the number of repetitions'],
        min: [0, 'Reps cannot be negative']
    },
    load: {
        type: Number,
        required: [true, 'Please specify the weight load'],
        min: [0, 'Load cannot be negative']
    },
    category: {
        type: String,
        enum: ['Strength', 'Cardio', 'Flexibility', 'Balance', 'Other'],
        default: 'Other'
    },
    duration: {
        type: Number,
        min: [0, 'Duration cannot be negative'],
        default: 0
    },
    notes: {
        type: String,
        default: ''
    },
    completed: {
        type: Boolean,
        default: false
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    calories: {
        type: Number,
        default: 0,
        min: [0, 'Calories cannot be negative']
    }
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);
