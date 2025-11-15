const Workout = require('../models/workoutModel');
const mongoose = require('mongoose');
const { calculateCalories } = require('../utils/calorieCalculator');

// Debug function to check controller is loaded
console.log('Workout controller loaded');

// Get all workouts with enhanced error handling
const getWorkouts = async (req, res) => {
    try {
        console.log('Fetching all workouts from database');
        const workouts = await Workout.find({}).sort({ createdAt: -1 });
        console.log(`Found ${workouts.length} workouts`);

        return res.status(200).json(workouts);
    } catch (error) {
        console.error('Error fetching workouts:', error);
        return res.status(500).json({
            error: 'Failed to fetch workouts',
            details: error.message
        });
    }
};

// Get a single workout by ID
const getWorkout = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid workout ID' });
    }

    const workout = await Workout.findById(id);

    if (!workout) {
        return res.status(404).json({ error: 'Workout not found' });
    }

    res.status(200).json(workout);
};

// Create workout with enhanced validation and logging
const createWorkout = async (req, res) => {
    try {
        console.log('Creating workout with data:', JSON.stringify(req.body));

        // Prepare workout data
        const workoutData = {
            title: req.body.title || 'Untitled Workout',
            reps: Number(req.body.reps) || 0,
            load: Number(req.body.load) || 0,
            category: req.body.category || 'Other',
            duration: Number(req.body.duration) || 0,
            notes: req.body.notes || '',
            completed: req.body.completed || false,
            difficulty: req.body.difficulty || 'Medium'
        };

        // Calculate calories burned
        workoutData.calories = calculateCalories(workoutData);

        // Create workout
        const workout = new Workout(workoutData);

        // Save to database
        const savedWorkout = await workout.save();
        console.log('Workout saved successfully:', savedWorkout._id);

        // Verify workout exists after saving
        const verifyWorkout = await Workout.findById(savedWorkout._id);
        if (!verifyWorkout) {
            throw new Error('Workout verification failed');
        }

        return res.status(201).json(savedWorkout);
    } catch (error) {
        console.error('Error creating workout:', error);
        return res.status(400).json({
            error: 'Failed to create workout',
            details: error.message
        });
    }
};

// Update a workout
const updateWorkout = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid workout ID' });
    }

    try {
        // Prepare update data with calorie calculation
        const updateData = { ...req.body };
        
        // Recalculate calories if any relevant fields are being updated
        const relevantFields = ['load', 'reps', 'duration', 'category', 'difficulty'];
        const hasRelevantChanges = relevantFields.some(field => field in updateData);
        
        if (hasRelevantChanges) {
            // Get current workout to merge with updates
            const currentWorkout = await Workout.findById(id);
            if (currentWorkout) {
                const mergedData = {
                    ...currentWorkout.toObject(),
                    ...updateData
                };
                updateData.calories = calculateCalories(mergedData);
            }
        }

        const workout = await Workout.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!workout) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        res.status(200).json(workout);
    } catch (error) {
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            for (const field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }
            return res.status(400).json({ error: 'Validation error', details: validationErrors });
        }
        res.status(400).json({ error: error.message });
    }
};

// Delete a workout
const deleteWorkout = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Invalid workout ID' });
    }

    const workout = await Workout.findByIdAndDelete(id);

    if (!workout) {
        return res.status(404).json({ error: 'Workout not found' });
    }

    res.status(200).json(workout);
};

// Get workout statistics
const getWorkoutStats = async (req, res) => {
    try {
        const stats = await Workout.aggregate([
            {
                $group: {
                    _id: null,
                    totalWorkouts: { $sum: 1 },
                    completedWorkouts: {
                        $sum: { $cond: ["$completed", 1, 0] }
                    },
                    averageLoad: { $avg: "$load" },
                    maxLoad: { $max: "$load" },
                    totalReps: { $sum: "$reps" },
                    categoryCounts: {
                        $push: "$category"
                    }
                }
            },
            {
                $addFields: {
                    categoryStats: {
                        $function: {
                            body: function (categories) {
                                const counts = {};
                                categories.forEach(cat => {
                                    counts[cat] = (counts[cat] || 0) + 1;
                                });
                                return Object.entries(counts).map(([category, count]) => ({
                                    category,
                                    count
                                }));
                            },
                            args: ["$categoryCounts"],
                            lang: "js"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalWorkouts: 1,
                    completedWorkouts: 1,
                    completionRate: {
                        $multiply: [
                            { $divide: ["$completedWorkouts", "$totalWorkouts"] },
                            100
                        ]
                    },
                    averageLoad: { $round: ["$averageLoad", 1] },
                    maxLoad: 1,
                    totalReps: 1,
                    categoryStats: 1
                }
            }
        ]);

        res.status(200).json(stats[0] || {
            totalWorkouts: 0,
            completedWorkouts: 0,
            completionRate: 0,
            averageLoad: 0,
            maxLoad: 0,
            totalReps: 0,
            categoryStats: []
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get workouts by date range for charts
const getWorkoutsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const workouts = await Workout.find(query).sort({ createdAt: 1 });

        // Process data for charts
        const processedData = processWorkoutsForCharts(workouts);

        res.status(200).json(processedData);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Helper function to process workout data for charts
const processWorkoutsForCharts = (workouts) => {
    // Group workouts by date
    const workoutsByDate = {};
    workouts.forEach(workout => {
        const dateStr = new Date(workout.createdAt).toLocaleDateString();
        if (!workoutsByDate[dateStr]) {
            workoutsByDate[dateStr] = [];
        }
        workoutsByDate[dateStr].push(workout);
    });

    // Format data for charts
    const dates = Object.keys(workoutsByDate).sort((a, b) => new Date(a) - new Date(b));

    // Load progression data
    const loadData = dates.map(date => {
        const dailyWorkouts = workoutsByDate[date];
        const avgLoad = dailyWorkouts.reduce((sum, w) => sum + w.load, 0) / dailyWorkouts.length;
        return { date, value: avgLoad };
    });

    // Reps progression data
    const repsData = dates.map(date => {
        const dailyWorkouts = workoutsByDate[date];
        const totalReps = dailyWorkouts.reduce((sum, w) => sum + w.reps, 0);
        return { date, value: totalReps };
    });

    // Category distribution
    const categoryData = {};
    workouts.forEach(workout => {
        const category = workout.category || 'Other';
        categoryData[category] = (categoryData[category] || 0) + 1;
    });

    return {
        loadProgression: loadData,
        repsProgression: repsData,
        categoryDistribution: Object.entries(categoryData).map(([category, count]) => ({
            category,
            count
        }))
    };
};

module.exports = {
    getWorkouts,
    getWorkout,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutStats,
    getWorkoutsByDateRange
};