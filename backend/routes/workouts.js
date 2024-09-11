const express = require('express'); // Import express
const router = express.Router(); // Initialize express router
const Workout = require('../models/workoutModel'); // Import workout model

const {
    createWorkout,
    getWorkouts,
    getWorkout,
    deleteWorkout,
    updateWorkout
} = require('../controllers/workoutController'); // Import createWorkout function from workout controller

// GET request to /api/workouts
router.get('/', getWorkouts) // This will get all workouts

// GET request to /api/workouts/:id
router.get('/:id', getWorkout) // This will get a single workout by id

// POST request to /api/workouts
router.post('/', createWorkout) // This will create a new workout

// DELETE request to /api/workouts/:id
router.delete('/:id', deleteWorkout) // This will delete a workout by id

// PATCH request to /api/workouts/:id
router.patch('/:id', updateWorkout) // This will update a workout by id

module.exports = router; // Export router