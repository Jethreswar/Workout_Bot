// backend/routes/workouts.js
const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const statsController = require('../controllers/statsController');

// Debug middleware for this router
router.use((req, res, next) => {
    console.log('Workout route accessed:', req.method, req.path);
    next();
});

// GET all workouts
router.get('/', workoutController.getWorkouts);

// GET workout statistics
router.get('/stats', statsController.getWorkoutStats);

// GET progress report
router.get('/progress', statsController.getProgressReport);

// GET workouts by date range for charts
router.get('/charts/:dateRange?', workoutController.getWorkoutsByDateRange);

// GET a single workout
router.get('/:id', workoutController.getWorkout);

// POST a new workout
router.post('/', workoutController.createWorkout);

// DELETE a workout
router.delete('/:id', workoutController.deleteWorkout);

// UPDATE a workout
router.patch('/:id', workoutController.updateWorkout);

module.exports = router;