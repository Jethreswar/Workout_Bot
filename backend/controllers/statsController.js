const Workout = require('../models/workoutModel');

// Get workout statistics
const getWorkoutStats = async (req, res) => {
    try {
        // Total workout count
        const totalWorkouts = await Workout.countDocuments();

        // Count by category
        const categoryStats = await Workout.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $project: { category: '$_id', count: 1, _id: 0 } },
            { $sort: { count: -1 } }
        ]);

        // Completion rate
        const completionStats = await Workout.aggregate([
            { $group: { _id: '$completed', count: { $sum: 1 } } }
        ]);

        const completedCount = completionStats.find(s => s._id === true)?.count || 0;
        const totalCount = completionStats.reduce((sum, item) => sum + item.count, 0);
        const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

        // Average and max load, plus calorie statistics
        const loadStats = await Workout.aggregate([
            {
                $group: {
                    _id: null,
                    averageLoad: { $avg: '$load' },
                    maxLoad: { $max: '$load' },
                    totalReps: { $sum: '$reps' },
                    totalCalories: { $sum: '$calories' },
                    averageCalories: { $avg: '$calories' },
                    maxCalories: { $max: '$calories' }
                }
            }
        ]);

        const stats = loadStats[0] || { 
            averageLoad: 0, 
            maxLoad: 0, 
            totalReps: 0, 
            totalCalories: 0, 
            averageCalories: 0, 
            maxCalories: 0 
        };

        // Calorie burn by category
        const caloriesByCategory = await Workout.aggregate([
            {
                $group: {
                    _id: '$category',
                    totalCalories: { $sum: '$calories' },
                    avgCalories: { $avg: '$calories' },
                    workoutCount: { $sum: 1 }
                }
            },
            { $sort: { totalCalories: -1 } }
        ]);

        // Average duration by category
        const durationByCategory = await Workout.aggregate([
            {
                $group: {
                    _id: '$category',
                    avgDuration: { $avg: '$duration' },
                    totalDuration: { $sum: '$duration' }
                }
            },
            { $sort: { avgDuration: -1 } }
        ]);

        // Workouts by difficulty
        const difficultyStats = await Workout.aggregate([
            { $group: { _id: '$difficulty', count: { $sum: 1 } } },
            { $project: { difficulty: '$_id', count: 1, _id: 0 } }
        ]);

        // Recent trends (weekly count)
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const weeklyTrend = await Workout.aggregate([
            { $match: { createdAt: { $gte: lastWeek } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            totalWorkouts,
            categoryStats,
            completionRate: Math.round(completionRate * 10) / 10,
            averageLoad: Math.round(stats.averageLoad * 10) / 10,
            maxLoad: stats.maxLoad,
            totalReps: stats.totalReps,
            // Calorie statistics
            totalCalories: stats.totalCalories || 0,
            averageCalories: Math.round((stats.averageCalories || 0) * 10) / 10,
            maxCalories: stats.maxCalories || 0,
            caloriesByCategory: caloriesByCategory.map(cat => ({
                category: cat._id,
                totalCalories: cat.totalCalories,
                avgCalories: Math.round(cat.avgCalories * 10) / 10,
                workoutCount: cat.workoutCount
            })),
            durationByCategory,
            difficultyStats,
            weeklyTrend,
            completionStats
        });
    } catch (error) {
        console.error('Error fetching workout stats:', error);
        res.status(400).json({ error: error.message });
    }
};

// Get progress report (comparing current vs previous periods)
const getProgressReport = async (req, res) => {
    try {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(today.getDate() - 60);

        // Current period (last 30 days)
        const currentPeriodStats = await Workout.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: null,
                    workoutCount: { $sum: 1 },
                    totalDuration: { $sum: '$duration' },
                    totalCalories: { $sum: '$calories' },
                    completedCount: {
                        $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
                    }
                }
            }
        ]);

        // Previous period (30-60 days ago)
        const previousPeriodStats = await Workout.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: sixtyDaysAgo,
                        $lt: thirtyDaysAgo
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    workoutCount: { $sum: 1 },
                    totalDuration: { $sum: '$duration' },
                    totalCalories: { $sum: '$calories' },
                    completedCount: {
                        $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
                    }
                }
            }
        ]);

        // Format the response with percentage changes
        const current = currentPeriodStats.length > 0 ? currentPeriodStats[0] : {
            workoutCount: 0,
            totalDuration: 0,
            totalCalories: 0,
            completedCount: 0
        };

        const previous = previousPeriodStats.length > 0 ? previousPeriodStats[0] : {
            workoutCount: 0,
            totalDuration: 0,
            totalCalories: 0,
            completedCount: 0
        };

        const calculateChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        const progressReport = {
            workouts: {
                current: current.workoutCount,
                previous: previous.workoutCount,
                percentChange: calculateChange(current.workoutCount, previous.workoutCount)
            },
            duration: {
                current: current.totalDuration,
                previous: previous.totalDuration,
                percentChange: calculateChange(current.totalDuration, previous.totalDuration)
            },
            calories: {
                current: current.totalCalories,
                previous: previous.totalCalories,
                percentChange: calculateChange(current.totalCalories, previous.totalCalories)
            },
            completion: {
                current: current.workoutCount > 0 ? (current.completedCount / current.workoutCount) * 100 : 0,
                previous: previous.workoutCount > 0 ? (previous.completedCount / previous.workoutCount) * 100 : 0,
                percentChange: calculateChange(
                    current.workoutCount > 0 ? (current.completedCount / current.workoutCount) : 0,
                    previous.workoutCount > 0 ? (previous.completedCount / previous.workoutCount) : 0
                )
            }
        };

        res.status(200).json(progressReport);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getWorkoutStats,
    getProgressReport
};