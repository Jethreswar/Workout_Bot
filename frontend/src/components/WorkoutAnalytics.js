import React, { useState, useEffect } from 'react';
import { useWorkoutsContext } from '../hooks/useWorkoutsContext';
import './WorkoutAnalytics.css';

const WorkoutAnalytics = () => {
    const { workouts } = useWorkoutsContext();
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        calculateStats();
    }, [workouts]);

    const calculateStats = () => {
        if (!workouts || workouts.length === 0) {
            setStats(null);
            return;
        }

        const totalWorkouts = workouts.length;
        const completedWorkouts = workouts.filter(w => w.completed).length;
        const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);
        const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        
        const categoryStats = workouts.reduce((acc, workout) => {
            const category = workout.category || 'Other';
            if (!acc[category]) {
                acc[category] = { count: 0, calories: 0 };
            }
            acc[category].count++;
            acc[category].calories += workout.calories || 0;
            return acc;
        }, {});

        const recentWorkouts = workouts
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 7);

        setStats({
            totalWorkouts,
            completedWorkouts,
            completionRate: totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0,
            totalCalories,
            totalDuration,
            categoryStats,
            recentWorkouts,
            averageCaloriesPerWorkout: totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0,
            averageDuration: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0
        });
    };

    const getAIAnalysis = async () => {
        if (!workouts || workouts.length === 0) {
            setAnalysis("Start logging workouts to get personalized AI insights! 🚀");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/chatbot/analyze');
            const data = await response.json();
            
            if (response.ok) {
                setAnalysis(data.analysis);
            } else {
                setAnalysis("Unable to generate analysis right now. Keep up the great work! 💪");
            }
        } catch (error) {
            console.error('Analysis error:', error);
            setAnalysis("Analysis temporarily unavailable. Your progress is still being tracked! 📊");
        } finally {
            setIsLoading(false);
        }
    };

    const getWorkoutSuggestions = async () => {
        setIsLoading(true);
        try {
            const preferences = {
                fitnessLevel: 'intermediate',
                goals: 'general fitness',
                timeAvailable: 30,
                preferredCategories: Object.keys(stats?.categoryStats || {})
            };

            const response = await fetch('/api/chatbot/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preferences)
            });

            const data = await response.json();
            
            if (response.ok) {
                setAnalysis(data.suggestions);
            } else {
                setAnalysis("Here are some general suggestions: Try mixing cardio and strength training, focus on proper form, and stay consistent! 🎯");
            }
        } catch (error) {
            console.error('Suggestions error:', error);
            setAnalysis("Try bodyweight exercises like squats, push-ups, and planks for a great full-body workout! 💪");
        } finally {
            setIsLoading(false);
        }
    };

    if (!stats && workouts && workouts.length === 0) {
        return (
            <div className="analytics-container">
                <div className="analytics-header">
                    <h3>🤖 AI Workout Analytics</h3>
                </div>
                <div className="no-data">
                    <p>🏃‍♀️ Start your fitness journey by logging your first workout!</p>
                    <button className="ai-btn" onClick={getWorkoutSuggestions}>
                        Get AI Suggestions
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <h3>🤖 AI Workout Analytics</h3>
                <div className="ai-buttons">
                    <button 
                        className="ai-btn analyze" 
                        onClick={getAIAnalysis}
                        disabled={isLoading}
                    >
                        {isLoading ? '🤔 Analyzing...' : '📊 AI Analysis'}
                    </button>
                    <button 
                        className="ai-btn suggest" 
                        onClick={getWorkoutSuggestions}
                        disabled={isLoading}
                    >
                        {isLoading ? '💭 Thinking...' : '💡 Get Suggestions'}
                    </button>
                </div>
            </div>

            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">🏆</div>
                        <div className="stat-info">
                            <h4>{stats.totalWorkouts}</h4>
                            <p>Total Workouts</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-info">
                            <h4>{stats.completionRate}%</h4>
                            <p>Completion Rate</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🔥</div>
                        <div className="stat-info">
                            <h4>{stats.totalCalories}</h4>
                            <p>Calories Burned</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">⏱️</div>
                        <div className="stat-info">
                            <h4>{Math.floor(stats.totalDuration / 60)}h {stats.totalDuration % 60}m</h4>
                            <p>Total Time</p>
                        </div>
                    </div>
                </div>
            )}

            {Object.keys(stats?.categoryStats || {}).length > 0 && (
                <div className="category-breakdown">
                    <h4>Workout Categories</h4>
                    <div className="category-list">
                        {Object.entries(stats.categoryStats).map(([category, data]) => (
                            <div key={category} className="category-item">
                                <span className="category-name">{category}</span>
                                <div className="category-stats">
                                    <span className="category-count">{data.count} workouts</span>
                                    <span className="category-calories">{data.calories} kcal</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {analysis && (
                <div className="ai-analysis">
                    <h4>🤖 AI Insights</h4>
                    <div className="analysis-content">
                        {analysis.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                    </div>
                </div>
            )}

            {!analysis && !isLoading && (
                <div className="analysis-prompt">
                    <p>💡 Click "AI Analysis" to get personalized insights about your workout progress!</p>
                </div>
            )}
        </div>
    );
};

export default WorkoutAnalytics;