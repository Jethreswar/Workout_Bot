const fitnessAI = require('../services/geminiService');
const Workout = require('../models/workoutModel');

/**
 * Chatbot Controller - Handles AI-powered fitness assistance
 */

// General chat with FitBot
const chat = async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Message is required',
                suggestion: 'Try asking something like: "Suggest a beginner workout" or "How to do push-ups correctly?"'
            });
        }

        console.log('Processing chat message:', message);

        const response = await fitnessAI.chat(message, conversationHistory);

        res.status(200).json({
            response,
            timestamp: new Date(),
            type: 'chat'
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            error: 'Failed to process chat message',
            fallback: "I'm having trouble connecting right now. Try asking about workout suggestions, exercise form, or fitness tips!"
        });
    }
};

// Get personalized workout suggestions
const getWorkoutSuggestions = async (req, res) => {
    try {
        const { 
            fitnessLevel = 'beginner', 
            goals = 'general fitness',
            equipment = 'none',
            timeAvailable = 30,
            preferredCategories = []
        } = req.body;

        // Get user's recent workouts for context
        const recentWorkouts = await Workout.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .select('title category difficulty load reps duration calories completed');

        const preferences = {
            fitnessLevel,
            goals,
            equipment,
            timeAvailable,
            preferredCategories,
            currentWorkouts: recentWorkouts
        };

        console.log('Generating workout suggestions for:', preferences);

        const suggestions = await fitnessAI.generateWorkoutSuggestions(preferences);

        res.status(200).json({
            suggestions,
            preferences,
            timestamp: new Date(),
            type: 'workout_suggestions'
        });

    } catch (error) {
        console.error('Workout suggestions error:', error);
        res.status(500).json({ 
            error: 'Failed to generate workout suggestions',
            fallback: "Here are some basic suggestions: Try bodyweight squats (3x10), push-ups (3x8), and planks (3x30s) for a quick full-body workout!"
        });
    }
};

// Analyze user's workout progress
const analyzeProgress = async (req, res) => {
    try {
        console.log('Analyzing user progress...');

        // Get all user workouts
        const workouts = await Workout.find({})
            .sort({ createdAt: -1 })
            .select('title category difficulty load reps duration calories completed createdAt notes');

        if (workouts.length === 0) {
            return res.status(200).json({
                analysis: "Welcome to your fitness journey! 🎉 You haven't logged any workouts yet, but that's okay - everyone starts somewhere! Try adding your first workout to get personalized insights and recommendations. I'm here to help you succeed! 💪",
                workoutCount: 0,
                type: 'progress_analysis'
            });
        }

        const analysis = await fitnessAI.analyzeProgress(workouts);

        res.status(200).json({
            analysis,
            workoutCount: workouts.length,
            timestamp: new Date(),
            type: 'progress_analysis'
        });

    } catch (error) {
        console.error('Progress analysis error:', error);
        res.status(500).json({ 
            error: 'Failed to analyze progress',
            fallback: "Keep up the great work! 🌟 Every workout counts towards your fitness goals. Stay consistent and you'll see amazing results!"
        });
    }
};

// Get exercise form tips and guidance
const getExerciseTips = async (req, res) => {
    try {
        const { exercise } = req.params;

        if (!exercise) {
            return res.status(400).json({ 
                error: 'Exercise name is required',
                example: 'Try: /api/chatbot/exercise-tips/push-ups'
            });
        }

        console.log('Getting tips for exercise:', exercise);

        const tips = await fitnessAI.getExerciseTips(exercise);

        res.status(200).json({
            tips,
            exercise,
            timestamp: new Date(),
            type: 'exercise_tips'
        });

    } catch (error) {
        console.error('Exercise tips error:', error);
        res.status(500).json({ 
            error: 'Failed to get exercise tips',
            fallback: `For ${req.params.exercise}: Focus on proper form, start slow, and gradually increase intensity. Always warm up first!`
        });
    }
};

// Create personalized workout plan
const createWorkoutPlan = async (req, res) => {
    try {
        const { 
            duration = '4 weeks',
            daysPerWeek = 3,
            sessionLength = 45,
            goals = 'general fitness',
            fitnessLevel = 'intermediate',
            equipment = 'gym access'
        } = req.body;

        const planRequest = {
            duration,
            daysPerWeek,
            sessionLength,
            goals,
            fitnessLevel,
            equipment
        };

        console.log('Creating workout plan:', planRequest);

        const workoutPlan = await fitnessAI.createWorkoutPlan(planRequest);

        res.status(200).json({
            workoutPlan,
            planRequest,
            timestamp: new Date(),
            type: 'workout_plan'
        });

    } catch (error) {
        console.error('Workout plan error:', error);
        res.status(500).json({ 
            error: 'Failed to create workout plan',
            fallback: "Here's a simple plan: Start with 3 days/week, combining strength exercises (squats, push-ups, rows) with 20 minutes of cardio. Progress gradually!"
        });
    }
};

// Validate API connection
const validateAPI = async (req, res) => {
    try {
        const validation = await fitnessAI.validateConnection();
        
        if (validation.success) {
            res.status(200).json({
                status: 'connected',
                message: '✅ Gemini AI is working properly!',
                aiAvailable: true,
                timestamp: new Date()
            });
        } else {
            res.status(200).json({
                status: 'fallback_mode',
                message: '⚠️ AI is currently unavailable, but the chatbot will still work with built-in responses!',
                error: validation.error,
                aiAvailable: false,
                fallbackMode: true,
                helpText: 'Get your API key from: https://makersuite.google.com/app/apikey',
                timestamp: new Date()
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: '❌ Unable to validate connection',
            error: error.message,
            aiAvailable: false,
            timestamp: new Date()
        });
    }
};

// Get detailed workout trends analysis
const getWorkoutTrends = async (req, res) => {
    try {
        console.log('Analyzing workout trends...');

        // Get all user workouts with full details
        const workouts = await Workout.find({})
            .sort({ createdAt: -1 })
            .select('title category difficulty load reps duration calories completed createdAt notes');

        if (workouts.length === 0) {
            return res.status(200).json({
                trends: "🌟 Ready to start your fitness journey? Begin by logging your first workout to unlock detailed trend analysis and see your progress over time! Every champion started with a single workout. 💪",
                workoutCount: 0,
                type: 'workout_trends'
            });
        }

        const trends = await fitnessAI.analyzeWorkoutTrends(workouts);

        res.status(200).json({
            trends,
            workoutCount: workouts.length,
            timestamp: new Date(),
            type: 'workout_trends'
        });

    } catch (error) {
        console.error('Workout trends error:', error);
        res.status(500).json({ 
            error: 'Failed to analyze workout trends',
            fallback: "Keep tracking your workouts! 📈 Over time, you'll see amazing patterns and improvements in your fitness journey!"
        });
    }
};

// Compare performance between time periods
const comparePerformance = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        console.log(`Comparing performance over ${days} days...`);

        // Get all user workouts
        const workouts = await Workout.find({})
            .sort({ createdAt: -1 })
            .select('title category difficulty load reps duration calories completed createdAt');

        if (workouts.length < 2) {
            return res.status(200).json({
                comparison: "🚀 You need at least a few workouts logged to compare your performance! Keep going - each workout is building toward your goals. Soon you'll see amazing comparisons showing your progress! 💪",
                workoutCount: workouts.length,
                type: 'performance_comparison'
            });
        }

        const comparison = await fitnessAI.comparePerformance(workouts, parseInt(days));

        res.status(200).json({
            comparison,
            periodDays: parseInt(days),
            workoutCount: workouts.length,
            timestamp: new Date(),
            type: 'performance_comparison'
        });

    } catch (error) {
        console.error('Performance comparison error:', error);
        res.status(500).json({ 
            error: 'Failed to compare performance',
            fallback: "Your progress is what matters most! 🌟 Keep logging workouts consistently and you'll see improvements over time!"
        });
    }
};

// Get specific workout insights and recommendations
const getWorkoutInsights = async (req, res) => {
    try {
        const { category, difficulty, days = 30 } = req.query;
        console.log('Getting workout insights...', { category, difficulty, days });

        // Build query based on filters
        const query = {};
        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;
        
        // Add date filter for recent workouts
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - parseInt(days));
        query.createdAt = { $gte: dateLimit };

        const workouts = await Workout.find(query)
            .sort({ createdAt: -1 })
            .select('title category difficulty load reps duration calories completed createdAt notes');

        if (workouts.length === 0) {
            const filterText = category || difficulty ? `for ${category || ''} ${difficulty || ''} workouts` : '';
            return res.status(200).json({
                insights: `No workouts found ${filterText} in the last ${days} days. Try logging some workouts or adjusting your filters! Every workout counts toward your fitness goals! 💪`,
                workoutCount: 0,
                filters: { category, difficulty, days: parseInt(days) },
                type: 'workout_insights'
            });
        }

        // Generate insights based on filtered data
        const insights = await fitnessAI.analyzeProgress(workouts);

        res.status(200).json({
            insights,
            workoutCount: workouts.length,
            filters: { category, difficulty, days: parseInt(days) },
            timestamp: new Date(),
            type: 'workout_insights'
        });

    } catch (error) {
        console.error('Workout insights error:', error);
        res.status(500).json({ 
            error: 'Failed to get workout insights',
            fallback: "Your dedication to fitness is inspiring! 🌟 Keep tracking your workouts for better insights and recommendations!"
        });
    }
};

// Get chatbot capabilities and help
const getHelp = async (req, res) => {
    try {
        const capabilities = {
            features: [
                {
                    name: "💬 Chat",
                    description: "Ask me anything about fitness, workouts, nutrition, or motivation!",
                    examples: ["How do I build muscle?", "What should I eat before a workout?", "I need motivation!"]
                },
                {
                    name: "🏋️ Workout Suggestions",
                    description: "Get personalized workout recommendations based on your goals and equipment",
                    examples: ["Suggest a beginner workout", "I have 20 minutes and dumbbells", "Full body strength routine"]
                },
                {
                    name: "📊 Progress Analysis",
                    description: "Analyze your workout history and get insights on your fitness journey",
                    examples: ["How am I doing?", "Analyze my progress", "What should I improve?"]
                },
                {
                    name: "🎯 Exercise Tips",
                    description: "Get proper form instructions and safety tips for any exercise",
                    examples: ["How to do squats properly?", "Push-up form tips", "Deadlift safety"]
                },
                {
                    name: "📅 Workout Plans",
                    description: "Create structured workout programs tailored to your goals",
                    examples: ["4-week strength plan", "Beginner fitness program", "Weight loss routine"]
                }
            ],
            quickCommands: [
                "Suggest a workout",
                "Analyze my progress",
                "How to do push-ups?",
                "Create a workout plan",
                "I need motivation",
                "Nutrition tips",
                "Exercise for beginners"
            ],
            tips: [
                "💡 Be specific about your fitness level and goals for better recommendations",
                "🎯 Ask about specific exercises to get detailed form guidance",
                "📈 Request progress analysis to see how you're improving",
                "⏰ Mention available time and equipment for personalized suggestions",
                "💪 Ask for motivation when you need an extra push!"
            ]
        };

        res.status(200).json({
            message: "Hi! I'm FitBot 🤖, your AI fitness assistant! Here's what I can help you with:",
            capabilities,
            timestamp: new Date(),
            type: 'help'
        });

    } catch (error) {
        console.error('Help error:', error);
        res.status(500).json({ 
            error: 'Failed to load help information',
            message: "I'm FitBot, your fitness assistant! Ask me about workouts, exercise form, nutrition, or motivation. I'm here to help! 💪"
        });
    }
};

module.exports = {
    chat,
    getWorkoutSuggestions,
    analyzeProgress,
    getExerciseTips,
    createWorkoutPlan,
    getWorkoutTrends,
    comparePerformance,
    getWorkoutInsights,
    getHelp,
    validateAPI
};