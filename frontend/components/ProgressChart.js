import React, { useEffect, useState, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chart.js/auto';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
Chart.register(...registerables);

const ProgressChart = ({ workouts }) => {
    const [chartType, setChartType] = useState('bar'); // 'bar' or 'line'
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    // Process workout data for charts
    const processWorkoutData = React.useCallback(() => {
        if (!workouts || workouts.length === 0) {
            return {
                labels: [],
                datasets: []
            };
        }

        // Group workouts by category
        const categories = {};
        const dateLabels = new Set();

        // Process the last 30 days of workouts for the chart
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const filteredWorkouts = workouts.filter(w =>
            new Date(w.createdAt) >= thirtyDaysAgo
        );

        // Group workouts by date and category
        filteredWorkouts.forEach(workout => {
            const date = new Date(workout.createdAt).toLocaleDateString();
            dateLabels.add(date);

            if (!categories[workout.category]) {
                categories[workout.category] = {};
            }

            if (!categories[workout.category][date]) {
                categories[workout.category][date] = 0;
            }

            // Add reps for this category and date
            categories[workout.category][date] += workout.reps;
        });

        // Sort date labels chronologically
        const sortedLabels = Array.from(dateLabels).sort(
            (a, b) => new Date(a) - new Date(b)
        );

        // Create dataset for each category
        const datasets = Object.keys(categories).map((category, index) => {
            // Generate a color based on index
            const hue = (index * 137) % 360; // Golden ratio for good color distribution
            const color = `hsl(${hue}, 70%, 60%)`;

            const data = sortedLabels.map(date => categories[category][date] || 0);

            return {
                label: category,
                data: data,
                backgroundColor: color,
                borderColor: color,
                borderWidth: 1
            };
        });

        return {
            labels: sortedLabels,
            datasets: datasets
        };
    }, [workouts]);

    // Toggle between chart types
    const toggleChartType = () => {
        setChartType(prev => prev === 'bar' ? 'line' : 'bar');
    };

    // Create/update chart when data or chart type changes
    useEffect(() => {
        // Don't try to create chart if no workouts data
        if (!workouts || workouts.length === 0) return;

        const chartData = processWorkoutData();

        // Destroy previous chart if it exists
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        // Create new chart
        const ctx = chartRef.current.getContext('2d');
        chartInstance.current = new Chart(ctx, {
            type: chartType,
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Repetitions'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Workout Progress by Category',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    legend: {
                        position: 'top'
                    }
                }
            }
        });

        // Cleanup function
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [workouts, chartType, processWorkoutData]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Workout Progress'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    return (
        <div className="progress-chart-container">
            <div className="chart-controls">
                <button onClick={toggleChartType} className="chart-toggle-btn">
                    Switch to {chartType === 'bar' ? 'Line' : 'Bar'} Chart
                </button>
            </div>

            <div className="chart-wrapper">
                {workouts && workouts.length > 0 ? (
                    <div className="chart-container">
                        <Line data={processWorkoutData()} options={options} />
                    </div>
                ) : (
                    <div className="no-data-message">
                        Add workouts to see your progress charts
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressChart;