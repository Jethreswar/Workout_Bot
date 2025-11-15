import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useWorkoutsContext } from '../hooks/useWorkoutsContext';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const WorkoutAnalytics = () => {
    const { workouts } = useWorkoutsContext();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/workouts/stats');
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch workout statistics');
                }

                setStats(data);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching workout stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [workouts]);

    // Calculate category distribution for chart
    const prepareCategoryChart = () => {
        if (!stats || !stats.categoryStats) return null;

        const labels = stats.categoryStats.map(item => item.category);
        const data = stats.categoryStats.map(item => item.count);
        const backgroundColors = [
            '#4acd8d', // primary green
            '#3366cc', // blue
            '#dc3545', // red
            '#ff9900', // orange
            '#9933cc', // purple
            '#669900'  // dark green
        ];

        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: backgroundColors.slice(0, data.length),
                    borderWidth: 1
                }
            ]
        };
    };

    const chartOptions = {
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    boxWidth: 15,
                    padding: 15
                }
            },
            title: {
                display: true,
                text: 'Workout Categories'
            }
        },
        cutout: '65%'
    };

    if (loading) return <div className="analytics-loading">Loading analytics...</div>;
    if (error) return <div className="analytics-error">Failed to load analytics: {error}</div>;
    if (!stats) return <div className="analytics-empty">No data available</div>;

    const chartData = prepareCategoryChart();

    return (
        <div className="workout-analytics">
            <h3>Workout Analytics</h3>

            <div className="analytics-grid">
                <div className="analytics-card total-workouts">
                    <span className="analytics-value">{stats.totalWorkouts}</span>
                    <span className="analytics-label">Total Workouts</span>
                </div>

                <div className="analytics-card completion-rate">
                    <span className="analytics-value">{Math.round(stats.completionRate)}%</span>
                    <span className="analytics-label">Completion Rate</span>
                </div>

                <div className="analytics-card avg-load">
                    <span className="analytics-value">{stats.averageLoad} kg</span>
                    <span className="analytics-label">Average Load</span>
                </div>

                <div className="analytics-card max-load">
                    <span className="analytics-value">{stats.maxLoad} kg</span>
                    <span className="analytics-label">Max Load</span>
                </div>
            </div>

            {chartData && chartData.labels.length > 0 && (
                <div className="chart-container doughnut">
                    <Doughnut data={chartData} options={chartOptions} />
                </div>
            )}

            <div className="analytics-footer">
                <p>Keep up the good work! Your consistency is key to progress.</p>
            </div>
        </div>
    );
};

export default WorkoutAnalytics;