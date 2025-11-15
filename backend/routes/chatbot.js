const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/chatbotController');

// Debug middleware for chatbot routes
router.use((req, res, next) => {
    console.log(`Chatbot API: ${req.method} ${req.originalUrl}`);
    next();
});

// GET /api/chatbot/validate - Validate API connection
router.get('/validate', validateAPI);

// GET /api/chatbot/help - Get chatbot capabilities and help
router.get('/help', getHelp);

// POST /api/chatbot/chat - General chat with FitBot
router.post('/chat', chat);

// POST /api/chatbot/suggestions - Get personalized workout suggestions
router.post('/suggestions', getWorkoutSuggestions);

// GET /api/chatbot/analyze - Analyze user's workout progress
router.get('/analyze', analyzeProgress);

// GET /api/chatbot/exercise-tips/:exercise - Get tips for specific exercise
router.get('/exercise-tips/:exercise', getExerciseTips);

// POST /api/chatbot/workout-plan - Create personalized workout plan
router.post('/workout-plan', createWorkoutPlan);

// GET /api/chatbot/trends - Get detailed workout trends analysis
router.get('/trends', getWorkoutTrends);

// GET /api/chatbot/compare - Compare performance between periods
router.get('/compare', comparePerformance);

// GET /api/chatbot/insights - Get specific workout insights with filters
router.get('/insights', getWorkoutInsights);

// Health check endpoint
router.get('/status', (req, res) => {
    res.status(200).json({
        status: 'online',
        service: 'FitBot AI Assistant',
        version: '1.0.0',
        timestamp: new Date(),
        endpoints: [
            'GET /validate - Validate API connection',
            'GET /help - Get chatbot capabilities',
            'POST /chat - General conversation',
            'POST /suggestions - Workout suggestions',
            'GET /analyze - Progress analysis',
            'GET /trends - Detailed workout trends',
            'GET /compare - Performance comparison',
            'GET /insights - Filtered workout insights',
            'GET /exercise-tips/:exercise - Exercise guidance',
            'POST /workout-plan - Create workout plan'
        ]
    });
});

module.exports = router;