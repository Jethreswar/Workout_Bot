/**
 * Calorie Calculation Utility
 * 
 * Calculates estimated calories burned based on workout type, intensity, duration, and load.
 * These are rough estimates based on general fitness guidelines.
 */

// Base calorie rates per minute for different categories (for average 70kg person)
const BASE_CALORIE_RATES = {
    'Strength': 6.0,      // Weight training
    'Cardio': 10.0,       // High-intensity cardio
    'Flexibility': 2.5,   // Stretching/yoga
    'Balance': 3.0,       // Balance exercises
    'Other': 4.0          // General activity
};

// Difficulty multipliers
const DIFFICULTY_MULTIPLIERS = {
    'Easy': 0.8,
    'Medium': 1.0,
    'Hard': 1.3
};

// Load intensity multiplier for strength training
const calculateLoadMultiplier = (load, category) => {
    if (category !== 'Strength') return 1.0;
    
    // For strength training, higher load means more calories
    if (load >= 100) return 1.5;      // Very heavy
    if (load >= 50) return 1.3;       // Heavy
    if (load >= 20) return 1.1;       // Moderate
    return 1.0;                       // Light
};

// Reps intensity multiplier for strength training
const calculateRepsMultiplier = (reps, category) => {
    if (category !== 'Strength' && category !== 'Other') return 1.0;
    
    // Higher reps generally mean more calories burned
    if (reps >= 20) return 1.2;       // High rep
    if (reps >= 10) return 1.1;       // Moderate rep
    return 1.0;                       // Low rep
};

/**
 * Calculate calories burned for a workout
 * @param {Object} workoutData - Workout information
 * @param {string} workoutData.category - Workout category
 * @param {string} workoutData.difficulty - Workout difficulty
 * @param {number} workoutData.duration - Duration in minutes
 * @param {number} workoutData.load - Weight load in kg
 * @param {number} workoutData.reps - Number of repetitions
 * @returns {number} Estimated calories burned
 */
const calculateCalories = (workoutData) => {
    const { category = 'Other', difficulty = 'Medium', duration = 0, load = 0, reps = 0 } = workoutData;
    
    // Get base calorie rate for the category
    const baseRate = BASE_CALORIE_RATES[category] || BASE_CALORIE_RATES['Other'];
    
    // Get difficulty multiplier
    const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;
    
    // Calculate load and reps multipliers
    const loadMultiplier = calculateLoadMultiplier(load, category);
    const repsMultiplier = calculateRepsMultiplier(reps, category);
    
    // For workouts without duration, estimate based on reps
    let effectiveDuration = duration;
    if (duration === 0 && reps > 0) {
        // Estimate 30 seconds per rep for strength training, 10 seconds for others
        const secondsPerRep = category === 'Strength' ? 30 : 10;
        effectiveDuration = (reps * secondsPerRep) / 60; // Convert to minutes
    }
    
    // If still no duration, use a minimum of 5 minutes
    if (effectiveDuration === 0) {
        effectiveDuration = 5;
    }
    
    // Calculate total calories
    const totalCalories = baseRate * effectiveDuration * difficultyMultiplier * loadMultiplier * repsMultiplier;
    
    // Round to nearest whole number and ensure minimum of 1 calorie
    return Math.max(1, Math.round(totalCalories));
};

/**
 * Get a formatted calorie display string
 * @param {number} calories - Number of calories
 * @returns {string} Formatted string like "125 kcal"
 */
const formatCalories = (calories) => {
    return `${calories} kcal`;
};

/**
 * Get calorie burn rate category
 * @param {number} calories - Number of calories
 * @param {number} duration - Duration in minutes
 * @returns {string} Intensity category
 */
const getCalorieIntensity = (calories, duration) => {
    if (duration === 0) return 'Unknown';
    
    const caloriesPerMinute = calories / duration;
    
    if (caloriesPerMinute >= 12) return 'Very High';
    if (caloriesPerMinute >= 8) return 'High';
    if (caloriesPerMinute >= 5) return 'Moderate';
    if (caloriesPerMinute >= 3) return 'Low';
    return 'Very Low';
};

module.exports = {
    calculateCalories,
    formatCalories,
    getCalorieIntensity,
    BASE_CALORIE_RATES,
    DIFFICULTY_MULTIPLIERS
};