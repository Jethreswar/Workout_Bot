import React from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { FaDumbbell, FaFire, FaStopwatch } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
);

const Dashboard = ({ stats }) => {
    if (!stats) {
        return <div className="dashboard loading">Loading statistics...</div>;
    }

    // Generate colors for categories
    const generateColors = (count) => {
        const colors = [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
        ];

        return Array(count).fill().map((_, i) => colors[i % colors.length]);
    };

    // Prepare data for category distribution chart
    const categoryData = {
        labels: stats.categoryCounts.map(c => c._id),
        datasets: [
            {
                data: stats.categoryCounts.map(c => c.count),
                backgroundColor: generateColors(stats.categoryCounts.length),
                borderWidth: 1
            }
        ]
    };

    // Prepare data for completion status chart
    const completedCount = stats.completionStats.find(s => s._id === true)?.count || 0;
    const incompleteCount = stats.completionStats.find(s => s._id === false)?.count || 0;

    const completionData = {
        labels: ['Completed', 'Incomplete'],
        datasets: [
            {
                data: [completedCount, incompleteCount],
                backgroundColor: ['rgba(75, 192, 112, 0.8)', 'rgba(255, 159, 64, 0.8)'],
                borderWidth: 1
            }
        ]
    };

    return (
        <div className="dashboard">
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-icon">
                        <FaDumbbell />
                    </div>
                    <div className="stat-content">
                        <h4>Total Workouts</h4>
                        <p className="stat-value">{stats.totalWorkouts}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FaFire />
                    </div>
                    <div className="stat-content">
                        <h4>Total Calories Burned</h4>
                        <p className="stat-value">{Math.round(stats.caloriesStats.totalCalories)} kcal</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        <FaStopwatch />
                    </div>
                    <div className="stat-content">
                        <h4>Avg. Workout Duration</h4>
                        <p className="stat-value">{Math.round(stats.avgDuration)} mins</p>
                    </div>
                </div>
            </div>

            <div className="charts-container">
                <div className="chart-card">
                    <h4>Workout Categories</h4>
                    <div className="chart-wrapper">
                        <Pie data={categoryData} options={{
                            responsive: true,
                            plugins: {
                                legend: { position: 'bottom' }
                            }
                        }} />
                    </div>
                </div>

                <div className="chart-card">
                    <h4>Completion Status</h4>
                    <div className="chart-wrapper">
                        <Pie data={completionData} options={{
                            responsive: true,
                            plugins: {
                                legend: { position: 'bottom' }
                            }
                        }} />
                    </div>
                </div>
            </div>

            <div className="additional-stats">
                <div className="stat-box">
                    <h4>Average Calories per Workout</h4>
                    <p className="big-stat">{Math.round(stats.caloriesStats.avgCalories)} kcal</p>
                </div>

                <div className="stat-box">
                    <h4>Completion Rate</h4>
                    <p className="big-stat">
                        {Math.round((completedCount / (completedCount + incompleteCount || 1)) * 100)}%
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;