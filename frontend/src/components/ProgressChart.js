import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const ProgressChart = ({ workouts }) => {
    const [chartType, setChartType] = useState('bar');
    const [viewType, setViewType] = useState('progress'); // 'progress' or 'category'
    const [stats, setStats] = useState(null);

    // Fetch statistics from backend
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/workouts/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        if (workouts && workouts.length > 0) {
            fetchStats();
        }
    }, [workouts]);

    // Process workout data for progress charts
    const processProgressData = () => {
        if (!workouts || workouts.length === 0) {
            return { labels: [], datasets: [] };
        }

        // Get last 30 days of workouts
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const filteredWorkouts = workouts.filter(w =>
            new Date(w.createdAt) >= thirtyDaysAgo
        ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        // Group by date
        const dailyData = {};
        filteredWorkouts.forEach(workout => {
            const date = new Date(workout.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            
            if (!dailyData[date]) {
                dailyData[date] = { reps: 0, load: 0, count: 0 };
            }
            
            dailyData[date].reps += workout.reps || 0;
            dailyData[date].load += workout.load || 0;
            dailyData[date].count += 1;
        });

        const labels = Object.keys(dailyData);
        const repsData = labels.map(date => dailyData[date].reps);
        const loadData = labels.map(date => dailyData[date].load);

        return {
            labels,
            datasets: [
                {
                    label: 'Total Reps',
                    data: repsData,
                    backgroundColor: 'rgba(74, 205, 141, 0.8)',
                    borderColor: 'rgba(74, 205, 141, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'Total Load (kg)',
                    data: loadData,
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    fill: false,
                    yAxisID: 'y1'
                }
            ]
        };
    };

    // Process workout data for category distribution
    const processCategoryData = () => {
        if (!stats || !stats.categoryStats) {
            return { labels: [], datasets: [] };
        }

        const colors = [
            'rgba(74, 205, 141, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
        ];

        return {
            labels: stats.categoryStats.map(cat => cat.category),
            datasets: [{
                data: stats.categoryStats.map(cat => cat.count),
                backgroundColor: colors.slice(0, stats.categoryStats.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        };
    };

    const progressOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: { size: 12 },
                    usePointStyle: true
                }
            },
            title: {
                display: true,
                text: 'Workout Progress (Last 30 Days)',
                font: { size: 16, weight: 'bold' }
            }
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Repetitions'
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Load (kg)'
                },
                grid: {
                    drawOnChartArea: false,
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Date'
                }
            }
        }
    };

    const categoryOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    font: { size: 12 },
                    usePointStyle: true,
                    generateLabels: (chart) => {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            return data.labels.map((label, i) => ({
                                text: `${label} (${data.datasets[0].data[i]})`,
                                fillStyle: data.datasets[0].backgroundColor[i],
                                hidden: false,
                                index: i
                            }));
                        }
                        return [];
                    }
                }
            },
            title: {
                display: true,
                text: 'Workout Categories Distribution',
                font: { size: 16, weight: 'bold' }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} workouts (${percentage}%)`;
                    }
                }
            }
        }
    };

    const toggleChartType = () => {
        setChartType(prev => prev === 'bar' ? 'line' : 'bar');
    };

    const toggleViewType = () => {
        setViewType(prev => prev === 'progress' ? 'category' : 'progress');
    };

    const renderChart = () => {
        if (viewType === 'category') {
            const categoryData = processCategoryData();
            if (!categoryData.labels.length) {
                return <div className="no-data-message">No category data available</div>;
            }
            return <Doughnut data={categoryData} options={categoryOptions} />;
        } else {
            const progressData = processProgressData();
            if (!progressData.labels.length) {
                return <div className="no-data-message">Add workouts to see progress charts</div>;
            }
            
            if (chartType === 'bar') {
                return <Bar data={progressData} options={progressOptions} />;
            } else {
                return <Line data={progressData} options={progressOptions} />;
            }
        }
    };

    return (
        <div className="progress-chart-container">
            <div className="chart-controls">
                <div>
                    <button onClick={toggleViewType} className="chart-toggle-btn">
                        {viewType === 'progress' ? 'Show Categories' : 'Show Progress'}
                    </button>
                    {viewType === 'progress' && (
                        <button onClick={toggleChartType} className="chart-toggle-btn" style={{ marginLeft: '10px' }}>
                            Switch to {chartType === 'bar' ? 'Line' : 'Bar'}
                        </button>
                    )}
                </div>
                
                {stats && (
                    <div style={{ fontSize: '14px', color: '#666' }}>
                        Total Workouts: {stats.totalWorkouts} | 
                        Completion Rate: {Math.round(stats.completionRate || 0)}%
                    </div>
                )}
            </div>

            <div className="chart-wrapper">
                <div className="chart-container">
                    {renderChart()}
                </div>
            </div>
        </div>
    );
};

export default ProgressChart;