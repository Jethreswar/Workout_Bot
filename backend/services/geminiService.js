const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
require('dotenv').config();

// API Key validation
const API_KEY = process.env.GEMINI_API_KEY;
const isValidApiKey = API_KEY && API_KEY !== 'your-api-key-here' && API_KEY.length > 10;

let genAI = null;
let model = null;

// Initialize Gemini AI with proper error handling and multiple model fallbacks
if (isValidApiKey) {
    try {
        genAI = new GoogleGenerativeAI(API_KEY);
        
        // Try current working model names (updated from Google AI API)
        const modelNames = [
            'models/gemini-2.5-flash',
            'models/gemini-2.0-flash',
            'models/gemini-flash-latest',
            'models/gemini-pro-latest',
            'models/gemini-2.5-pro',
            'models/gemini-2.0-pro-exp',
            'models/gemini-exp-1206'
        ];
        
        let modelInitialized = false;
        
        // We'll test the model asynchronously after initialization
        for (const modelName of modelNames) {
            try {
                model = genAI.getGenerativeModel({ model: modelName });
                console.log(`✅ Gemini AI model initialized: ${modelName}`);
                modelInitialized = true;
                break;
            } catch (modelError) {
                console.warn(`⚠️ Failed to initialize model ${modelName}:`, modelError.message.substring(0, 100));
                continue;
            }
        }
        
        if (!modelInitialized) {
            console.error('Failed to initialize any Gemini model. Using fallback responses.');
            model = null;
        }
        
    } catch (error) {
        console.error('Failed to initialize Gemini AI:', error.message);
        model = null;
    }
} else {
    console.warn('Gemini API key not configured. Chatbot will use fallback responses.');
    console.warn('   Get your API key from: https://makersuite.google.com/app/apikey');
    console.warn('   Add it to your .env file: GEMINI_API_KEY=your_key_here');
}

// Async function to test and validate the model after initialization
async function testModelConnection() {
    if (model && isValidApiKey) {
        try {
            const testResult = await model.generateContent('Hello');
            const testResponse = await testResult.response;
            console.log(`🧪 Model connection test successful: ${testResponse.text().substring(0, 30)}...`);
            return true;
        } catch (error) {
            console.warn('Model connection test failed:', error.message.substring(0, 100));
            console.warn('   Chatbot will use fallback responses');
            model = null; // Disable AI and use fallback
            return false;
        }
    }
    return false;
}

// Test connection after a brief delay to ensure everything is initialized
if (isValidApiKey && model) {
    setTimeout(() => {
        testModelConnection().catch(console.error);
    }, 1000);
}

/**
 * Fitness AI Assistant - Specialized for workout and fitness guidance
 */
class FitnessAI {
    constructor() {
        this.systemPrompt = `
You are FitBot, an expert fitness and workout assistant. Your role is to help users with:

1. WORKOUT SUGGESTIONS: Recommend exercises based on fitness goals, available equipment, and experience level
2. TECHNIQUE GUIDANCE: Provide proper form instructions and safety tips
3. PROGRAM DESIGN: Create structured workout routines for different goals (strength, cardio, flexibility)
4. NUTRITION ADVICE: Basic nutrition guidance to support fitness goals
5. MOTIVATION & SUPPORT: Encouraging and motivating users on their fitness journey
6. PROGRESS ANALYSIS: Analyze workout data and suggest improvements
7. INJURY PREVENTION: Provide safe exercise alternatives and recovery advice
8. TRACK WORKOUTS: Help users log and track their fitness activities

IMPORTANT FORMATTING GUIDELINES:
- Provide responses in PLAIN TEXT format only
- DO NOT use asterisks (*) or any markdown symbols
- DO NOT use bullet points with asterisks (*)
- Use simple dashes (-) for lists, not asterisks
- Use clear spacing and line breaks for structure
- Avoid all special formatting characters like **, ***, ##, etc.
- Keep text simple, clean, and readable
- Use simple emojis sparingly for engagement
- Format lists with simple dashes (-) or numbers (1., 2., 3.)

Content Guidelines:
- Always prioritize safety and proper form
- Adapt recommendations to user's fitness level
- Provide evidence-based advice
- Be encouraging and motivational
- Ask clarifying questions when needed
- Suggest modifications for different abilities
- Keep responses concise but informative

If asked about topics outside fitness/health, politely redirect to fitness-related topics.
`;
        
        // Initialize fallback responses
        this.fallbackResponses = {
            workoutSuggestions: this.getWorkoutSuggestionsFallback(),
            progressAnalysis: this.getProgressAnalysisFallback(),
            exerciseTips: this.getExerciseTipsFallback(),
            generalChat: this.getGeneralChatFallback(),
            workoutPlan: this.getWorkoutPlanFallback()
        };
    }

    /**
     * Format response for clean text output
     */
    formatResponse(text) {
        if (!text) return '';
        
        return text
            // Remove all markdown formatting
            .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
            .replace(/\*\*([^*]+)\*\*\*/g, '$1')
            .replace(/\*\*([^*]+)\*\*/g, '$1')
            .replace(/\*([^*]+)\*/g, '$1')
            // Remove standalone asterisks and bullet points
            .replace(/^\s*[\*\-\+]\s+/gm, '- ')
            .replace(/\s+\*\s+/g, ' - ')
            .replace(/\*{1,}/g, '')
            // Clean up other markdown symbols
            .replace(/#{1,6}\s*/g, '')
            .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            // Convert bullet points to simple dashes
            .replace(/•/g, '-')
            .replace(/◦/g, '-')
            .replace(/▪/g, '-')
            .replace(/▫/g, '-')
            // Normalize line breaks
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            // Clean up extra spaces
            .replace(/[ \t]+/g, ' ')
            .replace(/^[ \t]+|[ \t]+$/gm, '')
            // Remove multiple consecutive dashes
            .replace(/\-{2,}/g, '-')
            .trim();
    }

    /**
     * Check if AI is available
     */
    isAIAvailable() {
        return model !== null && isValidApiKey;
    }

    /**
     * Validate API connection
     */
    async validateConnection() {
        if (!this.isAIAvailable()) {
            return { 
                success: false, 
                error: 'API key not configured',
                details: 'No valid API key found or model not initialized'
            };
        }

        try {
            const testResult = await model.generateContent('Test connection - respond with "OK"');
            const response = await testResult.response;
            const responseText = response.text();
            
            return { 
                success: true, 
                message: 'Connection successful',
                response: responseText,
                model: model.model || 'unknown'
            };
        } catch (error) {
            console.error('Gemini API validation error:', error.message);
            
            // Provide helpful error categorization
            let errorCategory = 'unknown';
            let suggestion = 'Try again later or use fallback mode.';
            
            if (error.message.includes('API_KEY') || error.message.includes('403')) {
                errorCategory = 'authentication';
                suggestion = 'Check your API key in Google AI Studio.';
            } else if (error.message.includes('404') || error.message.includes('not found')) {
                errorCategory = 'model_not_found';
                suggestion = 'The model may be temporarily unavailable.';
            } else if (error.message.includes('quota') || error.message.includes('limit')) {
                errorCategory = 'quota_exceeded';
                suggestion = 'You\'ve reached your API usage limit. Check your Google AI Studio dashboard.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorCategory = 'network';
                suggestion = 'Check your internet connection.';
            }
            
            return { 
                success: false, 
                error: error.message,
                category: errorCategory,
                suggestion: suggestion
            };
        }
    }

    /**
     * Fallback workout suggestions when AI is unavailable
     */
    getWorkoutSuggestionsFallback(preferences = {}) {
        const { fitnessLevel = 'beginner', timeAvailable = 30, equipment = 'none' } = preferences;
        
        const suggestions = {
            beginner: {
                none: `🏃‍♀️ Beginner Bodyweight Workout (${timeAvailable} min)

Exercises:
1. Bodyweight Squats - 3 sets x 8-12 reps
   - Keep feet shoulder-width apart
   - Lower until thighs parallel to ground
   - Great for leg strength!

2. Modified Push-ups - 3 sets x 5-10 reps
   - Start on knees if needed
   - Keep straight line from head to knees
   - Builds upper body strength

3. Plank Hold - 3 sets x 15-30 seconds
   - Keep core tight and back straight
   - Excellent for core stability

4. Walking/Marching in Place - 5-10 minutes
   - Great cardio warm-up and cool-down

Tips:
- Rest 30-60 seconds between sets
- Focus on proper form over speed
- Listen to your body and modify as needed

🔥 Keep up the great work! Consistency is key! 💪`,
                basic: `🏋️‍♀️ Beginner Equipment Workout (${timeAvailable} min)

With Basic Equipment:
1. Dumbbell Squats - 3 sets x 10-15 reps
2. Dumbbell Chest Press - 3 sets x 8-12 reps
3. Bent-over Rows - 3 sets x 10-12 reps
4. Overhead Press - 3 sets x 8-10 reps
5. Romanian Deadlifts - 3 sets x 10-12 reps

✨ Start with lighter weights and focus on form!`
            },
            intermediate: {
                none: `🔥 **Intermediate Bodyweight Circuit (${timeAvailable} min)**

💪 **Circuit Training (3 rounds):**
1. **Jump Squats** - 15 reps
2. **Standard Push-ups** - 10-15 reps
3. **Mountain Climbers** - 20 reps (10 each leg)
4. **Burpees** - 8-10 reps
5. **Plank to Downward Dog** - 10 reps

⏱️ **Timing:**
• 45 seconds work, 15 seconds rest
• 1-2 minutes rest between rounds

🚀 Challenge yourself while maintaining good form!`,
                gym: `🏋️ **Intermediate Strength Training (${timeAvailable} min)**

💪 **Compound Movements:**
1. **Barbell Squats** - 4 sets x 8-12 reps
2. **Bench Press** - 4 sets x 8-10 reps
3. **Bent-over Rows** - 4 sets x 8-12 reps
4. **Overhead Press** - 3 sets x 8-10 reps
5. **Deadlifts** - 3 sets x 6-8 reps

📈 Progressive overload is key to growth!`
            }
        };

        const level = suggestions[fitnessLevel] || suggestions.beginner;
        const equipmentType = equipment === 'none' ? 'none' : (equipment.includes('gym') ? 'gym' : 'basic');
        
        return level[equipmentType] || level.none;
    }

    /**
     * Fallback progress analysis
     */
    getProgressAnalysisFallback(workoutHistory = []) {
        if (workoutHistory.length === 0) {
            return `🌟 Welcome to Your Fitness Journey! 🌟

🚀 You're just getting started, and that's exciting! Here are some tips to help you succeed:

Building Momentum:
- Start with 2-3 workouts per week
- Focus on consistency over intensity
- Track your workouts (you're already doing this!)
- Celebrate small victories

Recommended First Steps:
1. Begin with bodyweight exercises
2. Learn proper form before adding weight
3. Set realistic, achievable goals
4. Stay hydrated and get adequate sleep

This Week's Goal: Complete 2-3 short workouts!

Remember: Every expert was once a beginner. You've got this! 💪`;
        }

        const totalWorkouts = workoutHistory.length;
        const completed = workoutHistory.filter(w => w.completed).length;
        const completionRate = Math.round((completed / totalWorkouts) * 100);
        const totalCalories = workoutHistory.reduce((sum, w) => sum + (w.calories || 0), 0);

        return `📈 Your Fitness Progress Analysis 📈

Achievements:
• Total Workouts Logged: ${totalWorkouts}
• Completion Rate: ${completionRate}%
• Estimated Calories Burned: ${totalCalories} kcal

${completionRate >= 80 ? '🔥 **Outstanding!** You have excellent consistency!' : 
  completionRate >= 60 ? '💪 **Great job!** You\'re building solid habits!' : 
  '🌱 **Keep going!** Every workout counts towards your goals!'}

📈 **Recommendations:**
• ${completionRate < 70 ? 'Focus on consistency - try shorter, more manageable workouts' : 'Consider gradually increasing workout intensity'}
• Mix different types of exercises (strength, cardio, flexibility)
• Ensure adequate rest between intense sessions
• Track your progress weekly to stay motivated

🎯 **Next Steps:**
${totalWorkouts < 10 ? '• Focus on establishing a routine' : '• Consider progressive overload principles'}
• Set specific, measurable goals
• Celebrate your progress so far!

💪 Keep up the fantastic work! Your dedication is paying off!`;
    }

    /**
     * Fallback exercise tips
     */
    getExerciseTipsFallback(exerciseName = 'general exercise') {
        const commonExercises = {
            'push-up': `💪 **Push-up Form Guide** 💪

🎯 **Proper Form:**
1. Start in plank position, hands slightly wider than shoulders
2. Keep straight line from head to heels
3. Lower chest to ground, elbows at 45° angle
4. Push back up to starting position

⚠️ **Common Mistakes:**
• Sagging hips or raised butt
• Flaring elbows too wide
• Partial range of motion
• Looking up instead of keeping neutral neck

👶 **Beginner Modifications:**
• Wall push-ups
• Knee push-ups
• Incline push-ups (hands on bench)

💪 **Advanced Variations:**
• Diamond push-ups
• One-arm push-ups
• Plyometric push-ups`,
            
            'squat': `🏋️ **Squat Form Guide** 🏋️

🎯 **Proper Form:**
1. Feet shoulder-width apart, toes slightly out
2. Chest up, core engaged
3. Lower by pushing hips back, knees track over toes
4. Go to comfortable depth, ideally thighs parallel
5. Drive through heels to stand

⚠️ **Common Mistakes:**
• Knees caving inward
• Forward lean/losing chest position
• Rising on toes
• Shallow depth

🛡️ **Safety Tips:**
• Warm up properly
• Start with bodyweight
• Don't force depth - work on mobility
• Keep weight in heels`,
            
            'plank': `🔥 **Plank Form Guide** 🔥

🎯 **Proper Form:**
1. Forearms on ground, elbows under shoulders
2. Straight line from head to heels
3. Engage core, squeeze glutes
4. Breathe normally, don't hold breath

⚠️ **Common Mistakes:**
• Sagging hips
• Raised butt
• Looking up (keep neutral neck)
• Holding breath

👶 **Progressions:**
• Wall plank → Knee plank → Full plank
• Start with 15-30 seconds
• Focus on quality over duration`
        };

        const exercise = exerciseName.toLowerCase();
        for (const [key, guide] of Object.entries(commonExercises)) {
            if (exercise.includes(key)) {
                return guide;
            }
        }

        return `💪 **Exercise Guidance: ${exerciseName}** 💪

🎯 **General Exercise Principles:**
• **Warm-up first** - 5-10 minutes light movement
• **Focus on form** - Quality over quantity always
• **Start light** - Master the movement before adding weight
• **Full range of motion** - Work through complete movement
• **Controlled tempo** - Don't rush through reps

⚠️ **Safety First:**
• Stop if you feel pain (not muscle fatigue)
• Maintain proper breathing
• Use spotters for heavy weights
• Listen to your body

📈 **Progression Tips:**
• Master bodyweight version first
• Gradually increase difficulty
• Track your improvements
• Be patient with progress

💡 **Need specific form guidance?** Try searching online for "[exercise name] proper form" or consult a certified trainer!

🔥 Keep pushing your limits safely! 💪`;
    }

    /**
     * Fallback general chat responses
     */
    getGeneralChatFallback(message = '') {
        const responses = {
            motivation: `🔥 **You've Got This!** 🔥

Every champion was once a beginner who refused to give up! 💪

✨ **Remember:**
• Progress, not perfection
• Consistency beats intensity
• Your future self will thank you
• Small steps lead to big changes

🌟 **Today's Motivation:**
"The hardest part is showing up. You're already here, so you're already winning!"

💪 What workout are you planning today? I'm here to help!`,
            
            nutrition: `🥗 **Nutrition Basics for Fitness** 🥗

🎯 **Key Principles:**
• **Protein:** 0.8-1.2g per kg body weight
• **Hydration:** 8+ glasses of water daily
• **Timing:** Eat within 2 hours post-workout
• **Balance:** Include all macronutrients

⚡ **Pre-Workout (1-2 hours before):**
• Banana with peanut butter
• Oatmeal with berries
• Greek yogurt with granola

🔋 **Post-Workout (within 30-60 min):**
• Protein shake with fruit
• Chicken with rice
• Chocolate milk (simple and effective!)

💡 **Remember:** Nutrition supports your training - fuel your body right!`,
            
            rest: `😴 **Recovery is Part of Training** 😴

🛌 **Why Rest Matters:**
• Muscles grow during recovery
• Prevents overtraining and injury
• Improves performance
• Supports immune system

📅 **Recovery Guidelines:**
• 7-9 hours of sleep nightly
• 1-2 rest days per week
• Light activity on rest days (walking, stretching)
• Listen to your body's signals

🧘 **Active Recovery Ideas:**
• Gentle yoga or stretching
• Light walking or cycling
• Foam rolling
• Meditation or breathing exercises

💪 Your muscles grow when you rest, not just when you work out!`
        };

        const msg = message.toLowerCase();
        if (msg.includes('motivat') || msg.includes('encourage') || msg.includes('give up')) {
            return responses.motivation;
        }
        if (msg.includes('nutrition') || msg.includes('diet') || msg.includes('eat')) {
            return responses.nutrition;
        }
        if (msg.includes('rest') || msg.includes('recovery') || msg.includes('sleep')) {
            return responses.rest;
        }

        return `👋 **Hello! I'm FitBot!** 👋

I'm here to help with all your fitness questions! 🤖💪

I can help you with:
- Workout suggestions and planning
- Exercise form and safety tips
- Progress analysis and tracking
- Nutrition and recovery advice
- Motivation and support

Try asking me:
- "Suggest a 30-minute workout"
- "How do I do push-ups correctly?"
- "Analyze my progress"
- "I need motivation!"
- "What should I eat after a workout?"

🚀 What would you like to know about fitness today?`;
    }

    /**
     * Fallback workout plan
     */
    getWorkoutPlanFallback(planRequest = {}) {
        const { daysPerWeek = 3, sessionLength = 45, goals = 'general fitness' } = planRequest;
        
        return `📅 **${daysPerWeek}-Day Fitness Plan** 📅

🎯 **Goal:** ${goals}
⏱️ **Session Length:** ${sessionLength} minutes

**Week Structure:**
${daysPerWeek >= 3 ? `
**Day 1: Upper Body Strength**
• Push-ups: 3x8-12
• Rows: 3x10-12
• Overhead press: 3x8-10
• Plank: 3x30-60s

**Day 2: Lower Body & Cardio**
• Squats: 3x12-15
• Lunges: 3x10 each leg
• Calf raises: 3x15-20
• 15-20 min cardio

**Day 3: Full Body Circuit**
• Burpees: 3x5-8
• Mountain climbers: 3x20
• Jump squats: 3x10-12
• Push-up to T: 3x8-10` : `
**Day 1 & 2: Full Body Workouts**
• Squats: 3x10-15
• Push-ups: 3x8-12
• Plank: 3x30-45s
• Walking: 15-20 min

**Day 3: Active Recovery**
• Light stretching
• Walking
• Yoga or mobility work`}

📈 **Progression:**
• Week 1-2: Focus on form
• Week 3-4: Increase reps/time
• Week 5-6: Add difficulty/weight

🎯 **Success Tips:**
• Track your workouts
• Rest 48hrs between intense sessions
• Stay hydrated
• Get adequate sleep

💪 Consistency is key - you've got this!`;
    }

    /**
     * Generate workout suggestions based on user preferences
     * @param {Object} preferences - User workout preferences
     * @returns {Promise<string>} AI-generated workout suggestions
     */
    async generateWorkoutSuggestions(preferences) {
        const {
            fitnessLevel = 'beginner',
            goals = 'general fitness',
            equipment = 'none',
            timeAvailable = 30,
            preferredCategories = [],
            currentWorkouts = []
        } = preferences;

        // Analyze user's workout history for better suggestions
        const workoutHistory = currentWorkouts || [];
        const recentCategories = [...new Set(workoutHistory.slice(0, 5).map(w => w.category))];
        const avgLoad = workoutHistory.length > 0 ? 
            workoutHistory.reduce((sum, w) => sum + (w.load || 0), 0) / workoutHistory.length : 0;
        const avgReps = workoutHistory.length > 0 ? 
            workoutHistory.reduce((sum, w) => sum + (w.reps || 0), 0) / workoutHistory.length : 0;
        const lastWorkouts = workoutHistory.slice(0, 3).map(w => w.title).join(', ');
        
        const prompt = `
${this.systemPrompt}

CURRENT USER PROFILE:
- Fitness Level: ${fitnessLevel}
- Primary Goals: ${goals}
- Available Equipment: ${equipment}
- Time Available: ${timeAvailable} minutes
- Preferred Categories: ${preferredCategories.join(', ') || 'any'}

USER'S WORKOUT HISTORY ANALYSIS:
- Total Workouts Logged: ${workoutHistory.length}
- Recent Categories Trained: ${recentCategories.join(', ') || 'None yet'}
- Average Weight Used: ${Math.round(avgLoad)} kg
- Average Reps: ${Math.round(avgReps)}
- Last 3 Workouts: ${lastWorkouts || 'No previous workouts'}

RECENT WORKOUT PERFORMANCE:
${workoutHistory.slice(0, 5).map((w, index) => `${index + 1}. ${w.title} (${w.category})
   - Load: ${w.load}kg, Reps: ${w.reps}, Duration: ${w.duration}min
   - Difficulty: ${w.difficulty}, Completed: ${w.completed ? 'Yes' : 'No'}`).join('\n')}

Based on this user's history and current preferences, suggest 3-5 specific workouts that:
1. Build upon their previous training (if any)
2. Address any gaps in their routine
3. Match their current fitness level and progression
4. Fit their available time and equipment
5. Align with their stated goals

For each suggested workout, include:
- Exercise name
- Recommended sets/reps or duration (considering their history)
- Progressive difficulty from their current level
- Brief technique tip
- How this builds on their previous training
- Why this exercise fits their goals

Make suggestions motivating and appropriately challenging!
        `;

        // Use AI if available, otherwise fallback
        if (this.isAIAvailable()) {
            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return this.formatResponse(response.text());
            } catch (error) {
                console.error('Gemini API Error:', error);
                console.log('Using fallback response for workout suggestions');
                return this.getWorkoutSuggestionsFallback(preferences);
            }
        } else {
            console.log('AI not available, using fallback workout suggestions');
            return this.getWorkoutSuggestionsFallback(preferences);
        }
    }

    /**
     * Analyze user's workout progress and provide insights
     * @param {Array} workoutHistory - User's workout history from database
     * @returns {Promise<string>} AI-generated progress analysis
     */
    async analyzeProgress(workoutHistory) {
        const totalWorkouts = workoutHistory.length;
        const completedWorkouts = workoutHistory.filter(w => w.completed).length;
        const totalCalories = workoutHistory.reduce((sum, w) => sum + (w.calories || 0), 0);
        const categories = [...new Set(workoutHistory.map(w => w.category))];
        
        // Calculate additional insights
        const avgLoad = workoutHistory.reduce((sum, w) => sum + (w.load || 0), 0) / totalWorkouts;
        const avgReps = workoutHistory.reduce((sum, w) => sum + (w.reps || 0), 0) / totalWorkouts;
        const avgDuration = workoutHistory.reduce((sum, w) => sum + (w.duration || 0), 0) / totalWorkouts;
        const avgCaloriesPerWorkout = totalCalories / totalWorkouts;
        
        // Difficulty distribution
        const difficultyCount = workoutHistory.reduce((acc, w) => {
            acc[w.difficulty] = (acc[w.difficulty] || 0) + 1;
            return acc;
        }, {});
        
        // Category distribution
        const categoryCount = workoutHistory.reduce((acc, w) => {
            acc[w.category] = (acc[w.category] || 0) + 1;
            return acc;
        }, {});
        
        // Recent progress (last 7 days vs previous 7 days)
        const now = new Date();
        const last7Days = workoutHistory.filter(w => 
            new Date(w.createdAt) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        );
        const previous7Days = workoutHistory.filter(w => {
            const date = new Date(w.createdAt);
            return date > new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) &&
                   date <= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        });
        
        const recentWorkouts = workoutHistory
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);

        const prompt = `
${this.systemPrompt}

Please analyze this user's comprehensive workout data and provide detailed insights:

OVERALL STATISTICS:
- Total Workouts Logged: ${totalWorkouts}
- Completed Workouts: ${completedWorkouts} (${Math.round((completedWorkouts/totalWorkouts)*100)}% completion rate)
- Total Calories Burned: ${totalCalories} kcal
- Average Calories Per Workout: ${Math.round(avgCaloriesPerWorkout)} kcal
- Categories Used: ${categories.join(', ')}

WORKOUT INTENSITY METRICS:
- Average Load/Weight: ${Math.round(avgLoad)} kg
- Average Reps: ${Math.round(avgReps)}
- Average Duration: ${Math.round(avgDuration)} minutes

DIFFICULTY PROGRESSION:
${Object.entries(difficultyCount).map(([diff, count]) => `- ${diff}: ${count} workouts`).join('\n')}

CATEGORY BREAKDOWN:
${Object.entries(categoryCount).map(([cat, count]) => `- ${cat}: ${count} workouts (${Math.round(count/totalWorkouts*100)}%)`).join('\n')}

RECENT ACTIVITY COMPARISON:
- Last 7 Days: ${last7Days.length} workouts
- Previous 7 Days: ${previous7Days.length} workouts
- Trend: ${last7Days.length > previous7Days.length ? 'Increasing' : last7Days.length < previous7Days.length ? 'Decreasing' : 'Stable'}

MOST RECENT WORKOUTS:
${recentWorkouts.map((w, index) => `${index + 1}. ${w.title} (${w.category})
   - Load: ${w.load}kg, Reps: ${w.reps}, Duration: ${w.duration}min
   - Difficulty: ${w.difficulty}, Calories: ${w.calories || 0} kcal
   - Status: ${w.completed ? 'Completed' : 'Incomplete'}
   - Date: ${new Date(w.createdAt).toLocaleDateString()}`).join('\n\n')}

Provide:
1. Progress highlights and achievements 🎉
2. Areas for improvement 📈
3. Specific recommendations for next workouts 💪
4. Motivational feedback 🔥

Keep it encouraging and actionable!
        `;

        // Use AI if available, otherwise fallback
        if (this.isAIAvailable()) {
            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return this.formatResponse(response.text());
            } catch (error) {
                console.error('Gemini API Error:', error);
                console.log('Using fallback response for progress analysis');
                return this.getProgressAnalysisFallback(workoutHistory);
            }
        } else {
            console.log('AI not available, using fallback progress analysis');
            return this.getProgressAnalysisFallback(workoutHistory);
        }
    }

    /**
     * Get exercise form tips and safety advice
     * @param {string} exerciseName - Name of the exercise
     * @returns {Promise<string>} AI-generated form guidance
     */
    async getExerciseTips(exerciseName) {
        const prompt = `
${this.systemPrompt}

The user is asking about: "${exerciseName}"

Please provide:
1. Proper form instructions 🎯
2. Common mistakes to avoid ⚠️
3. Safety tips 🛡️
4. Beginner modifications 👶
5. Advanced variations 💪

Keep it clear, concise, and safety-focused!
        `;

        // Use AI if available, otherwise fallback
        if (this.isAIAvailable()) {
            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return this.formatResponse(response.text());
            } catch (error) {
                console.error('Gemini API Error:', error);
                console.log('Using fallback response for exercise tips');
                return this.getExerciseTipsFallback(exerciseName);
            }
        } else {
            console.log('AI not available, using fallback exercise tips');
            return this.getExerciseTipsFallback(exerciseName);
        }
    }

    /**
     * General chat with the fitness AI
     * @param {string} message - User's message
     * @param {Array} conversationHistory - Previous conversation context
     * @returns {Promise<string>} AI response
     */
    async chat(message, conversationHistory = []) {
        const context = conversationHistory.length > 0 
            ? `Previous conversation:\n${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\n`
            : '';

        const prompt = `
${this.systemPrompt}

${context}User: ${message}

FitBot:`;

        // Use AI if available, otherwise fallback
        if (this.isAIAvailable()) {
            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return this.formatResponse(response.text());
            } catch (error) {
                console.error('Gemini API Error:', error);
                console.log('Using fallback response for chat');
                return this.getGeneralChatFallback(message);
            }
        } else {
            console.log('AI not available, using fallback chat response');
            return this.getGeneralChatFallback(message);
        }
    }

    /**
     * Analyze workout trends and patterns from user data
     * @param {Array} workoutHistory - Complete workout history
     * @returns {Promise<string>} Detailed trend analysis
     */
    async analyzeWorkoutTrends(workoutHistory) {
        if (!workoutHistory || workoutHistory.length === 0) {
            return "No workout data available yet. Start logging your workouts to see detailed trends and patterns!";
        }

        // Calculate trends over time
        const sortedWorkouts = workoutHistory.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const firstWorkout = sortedWorkouts[0];
        const latestWorkout = sortedWorkouts[sortedWorkouts.length - 1];
        const daysSinceStart = Math.ceil((new Date(latestWorkout.createdAt) - new Date(firstWorkout.createdAt)) / (1000 * 60 * 60 * 24));
        
        // Strength progression analysis
        const strengthWorkouts = workoutHistory.filter(w => w.category === 'Strength');
        const loadProgression = strengthWorkouts.length > 1 ? 
            ((strengthWorkouts[strengthWorkouts.length - 1]?.load || 0) - (strengthWorkouts[0]?.load || 0)) : 0;
        
        // Weekly activity pattern
        const workoutsByWeek = {};
        workoutHistory.forEach(w => {
            const weekStart = new Date(w.createdAt);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekKey = weekStart.toISOString().split('T')[0];
            workoutsByWeek[weekKey] = (workoutsByWeek[weekKey] || 0) + 1;
        });
        
        const prompt = `
${this.systemPrompt}

Analyze these detailed workout trends and provide insights:

TIMELINE ANALYSIS:
- Training Period: ${daysSinceStart} days (from ${new Date(firstWorkout.createdAt).toLocaleDateString()} to ${new Date(latestWorkout.createdAt).toLocaleDateString()})
- Total Workouts: ${workoutHistory.length}
- Average Workouts Per Week: ${Math.round((workoutHistory.length / daysSinceStart) * 7)}

STRENGTH PROGRESSION:
- Strength Workouts: ${strengthWorkouts.length}
- Load Progression: ${loadProgression > 0 ? '+' : ''}${loadProgression} kg overall
- Latest Strength Session: ${strengthWorkouts[strengthWorkouts.length - 1]?.title || 'None'} (${strengthWorkouts[strengthWorkouts.length - 1]?.load || 0} kg)

WEEKLY ACTIVITY PATTERNS:
${Object.entries(workoutsByWeek).slice(-4).map(([week, count]) => `- Week of ${week}: ${count} workouts`).join('\n')}

WORKOUT CONSISTENCY:
${sortedWorkouts.slice(-10).map((w, index) => `${index + 1}. ${new Date(w.createdAt).toLocaleDateString()}: ${w.title} (${w.category}, ${w.difficulty})`).join('\n')}

Provide insights on:
1. Progress trends and improvements
2. Consistency patterns
3. Areas showing good development
4. Potential areas for improvement
5. Recommendations for continued progress
`;

        if (this.isAIAvailable()) {
            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return this.formatResponse(response.text());
            } catch (error) {
                console.error('Gemini API Error:', error);
                return this.getWorkoutTrendsFallback(workoutHistory);
            }
        } else {
            return this.getWorkoutTrendsFallback(workoutHistory);
        }
    }

    /**
     * Fallback workout trends analysis
     */
    getWorkoutTrendsFallback(workoutHistory) {
        if (!workoutHistory || workoutHistory.length === 0) {
            return "Start logging workouts to see your progress trends! 💪";
        }

        const totalWorkouts = workoutHistory.length;
        const categories = [...new Set(workoutHistory.map(w => w.category))];
        const avgCalories = workoutHistory.reduce((sum, w) => sum + (w.calories || 0), 0) / totalWorkouts;
        const completionRate = (workoutHistory.filter(w => w.completed).length / totalWorkouts) * 100;

        return `Workout Trends Analysis

📊 Summary:
- Total Workouts: ${totalWorkouts}
- Categories Trained: ${categories.join(', ')}
- Average Calories per Session: ${Math.round(avgCalories)} kcal
- Completion Rate: ${Math.round(completionRate)}%

💪 Key Insights:
- You're building a consistent workout routine
- Training across ${categories.length} different categories shows good variety
- ${completionRate >= 80 ? 'Excellent completion rate - keep it up!' : 'Consider focusing on completing more workouts'}

🎯 Recommendations:
- Continue tracking your workouts for better insights
- ${categories.length < 3 ? 'Try adding variety with different exercise categories' : 'Good variety in your training'}
- Focus on progressive overload to continue improving

Keep up the great work! Consistency is key to reaching your fitness goals! 🌟`;
    }

    /**
     * Compare current performance with previous periods
     * @param {Array} workoutHistory - Complete workout history
     * @param {number} daysToCompare - Number of days to compare (default 30)
     * @returns {Promise<string>} Performance comparison
     */
    async comparePerformance(workoutHistory, daysToCompare = 30) {
        if (!workoutHistory || workoutHistory.length === 0) {
            return "No workout data available for comparison. Keep logging your workouts! 💪";
        }

        const now = new Date();
        const compareDate = new Date(now.getTime() - daysToCompare * 24 * 60 * 60 * 1000);
        
        const recentWorkouts = workoutHistory.filter(w => new Date(w.createdAt) > compareDate);
        const previousWorkouts = workoutHistory.filter(w => {
            const date = new Date(w.createdAt);
            return date <= compareDate && date > new Date(compareDate.getTime() - daysToCompare * 24 * 60 * 60 * 1000);
        });

        if (recentWorkouts.length === 0 && previousWorkouts.length === 0) {
            return "Not enough data for comparison. Keep working out consistently! 🎯";
        }

        const recentStats = {
            count: recentWorkouts.length,
            avgLoad: recentWorkouts.reduce((sum, w) => sum + (w.load || 0), 0) / recentWorkouts.length || 0,
            avgReps: recentWorkouts.reduce((sum, w) => sum + (w.reps || 0), 0) / recentWorkouts.length || 0,
            totalCalories: recentWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0),
            completionRate: (recentWorkouts.filter(w => w.completed).length / recentWorkouts.length) * 100 || 0
        };

        const previousStats = {
            count: previousWorkouts.length,
            avgLoad: previousWorkouts.reduce((sum, w) => sum + (w.load || 0), 0) / previousWorkouts.length || 0,
            avgReps: previousWorkouts.reduce((sum, w) => sum + (w.reps || 0), 0) / previousWorkouts.length || 0,
            totalCalories: previousWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0),
            completionRate: (previousWorkouts.filter(w => w.completed).length / previousWorkouts.length) * 100 || 0
        };

        return `Performance Comparison (Last ${daysToCompare} Days vs Previous ${daysToCompare} Days)

📊 Workout Frequency:
- Recent: ${recentStats.count} workouts
- Previous: ${previousStats.count} workouts
- Change: ${recentStats.count > previousStats.count ? '+' : ''}${recentStats.count - previousStats.count} workouts

💪 Strength Metrics:
- Average Load: ${Math.round(recentStats.avgLoad)} kg vs ${Math.round(previousStats.avgLoad)} kg
- Average Reps: ${Math.round(recentStats.avgReps)} vs ${Math.round(previousStats.avgReps)}

🔥 Performance:
- Total Calories: ${recentStats.totalCalories} vs ${previousStats.totalCalories} kcal
- Completion Rate: ${Math.round(recentStats.completionRate)}% vs ${Math.round(previousStats.completionRate)}%

${recentStats.count > previousStats.count ? '🎉 Great job increasing your workout frequency!' : 
  recentStats.avgLoad > previousStats.avgLoad ? '💪 Excellent strength progression!' :
  recentStats.completionRate > previousStats.completionRate ? '✅ Improved completion rate!' :
  '🌟 Keep pushing forward - consistency leads to results!'}`;
    }

    /**
     * Create a personalized workout plan
     * @param {Object} planRequest - Workout plan requirements
     * @returns {Promise<string>} AI-generated workout plan
     */
    async createWorkoutPlan(planRequest) {
        const {
            duration = '4 weeks',
            daysPerWeek = 3,
            sessionLength = 45,
            goals = 'general fitness',
            fitnessLevel = 'intermediate',
            equipment = 'gym access'
        } = planRequest;

        const prompt = `
${this.systemPrompt}

Create a personalized workout plan with these specifications:
- Duration: ${duration}
- Frequency: ${daysPerWeek} days per week
- Session Length: ${sessionLength} minutes
- Primary Goals: ${goals}
- Fitness Level: ${fitnessLevel}
- Equipment: ${equipment}

Please provide:
1. Weekly structure overview 📅
2. Sample workout for each day type 💪
3. Progressive overload strategy 📈
4. Rest and recovery guidance 😴
5. Tips for staying consistent 🎯

Make it practical and actionable!
        `;

        // Use AI if available, otherwise fallback
        if (this.isAIAvailable()) {
            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return this.formatResponse(response.text());
            } catch (error) {
                console.error('Gemini API Error:', error);
                console.log('Using fallback response for workout plan');
                return this.getWorkoutPlanFallback(planRequest);
            }
        } else {
            console.log('AI not available, using fallback workout plan');
            return this.getWorkoutPlanFallback(planRequest);
        }
    }
}

// Export singleton instance
const fitnessAI = new FitnessAI();

module.exports = fitnessAI;