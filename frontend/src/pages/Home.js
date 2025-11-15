import { useEffect, useState } from 'react';
import WorkoutDetails from '../components/WorkoutDetails';
import WorkoutForm from '../components/WorkoutForm';
import FilterBar from '../components/FilterBar';
import ProgressChart from '../components/ProgressChart';
import WorkoutAnalytics from '../components/WorkoutAnalytics';

const Home = () => {
    const [workouts, setWorkouts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCharts, setShowCharts] = useState(false);
    const [lastRefreshTime, setLastRefreshTime] = useState(null);

    const [filters, setFilters] = useState({
        category: '',
        status: '',
        difficulty: '',
        sortBy: 'newest'
    });

    // Function to fetch workouts
    const fetchWorkouts = async () => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('Fetching workouts from API...');
            const response = await fetch('/api/workouts');

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`Fetched ${data.length} workouts`);

            setWorkouts(Array.isArray(data) ? data : []);
            setLastRefreshTime(new Date());
        } catch (err) {
            console.error('Error fetching workouts:', err);
            setError(`Failed to load workouts: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch workouts on component mount
    useEffect(() => {
        fetchWorkouts();
    }, []);

    // Handle workout added
    const handleWorkoutAdded = async (newWorkout) => {
        // Optimistically add to UI
        setWorkouts(prev => [newWorkout, ...prev]);

        // Then refresh to ensure data is up to date
        await fetchWorkouts();
    };

    // Handle workout deletion
    const handleDeleteWorkout = async (workoutId) => {
        try {
            const response = await fetch(`/api/workouts/${workoutId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Remove from UI
                setWorkouts(prev => prev.filter(w => w._id !== workoutId));
            } else {
                console.error('Failed to delete workout');
                // Refresh to ensure UI is in sync
                fetchWorkouts();
            }
        } catch (error) {
            console.error('Error deleting workout:', error);
        }
    };

    // Apply filters and sorting
    const getFilteredWorkouts = () => {
        let result = [...workouts];

        // Apply category filter
        if (filters.category) {
            result = result.filter(w => w.category === filters.category);
        }

        // Apply status filter
        if (filters.status === 'completed') {
            result = result.filter(w => w.completed);
        } else if (filters.status === 'incomplete') {
            result = result.filter(w => !w.completed);
        }

        // Apply difficulty filter
        if (filters.difficulty) {
            result = result.filter(w => w.difficulty === filters.difficulty);
        }

        // Apply sorting
        switch (filters.sortBy) {
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'title':
                result.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'highLoad':
                result.sort((a, b) => b.load - a.load);
                break;
            case 'lowLoad':
                result.sort((a, b) => a.load - b.load);
                break;
            default:
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return result;
    };

    const filteredWorkouts = getFilteredWorkouts();

    return (
        <div className="container">
            <div className="home">
                <div className="workouts-section">
                    <div className="section-header">
                        <h2>My Workouts</h2>
                        <div className="header-actions">
                            <button onClick={fetchWorkouts} className="refresh-btn">
                                Refresh
                            </button>
                            <button onClick={() => setShowCharts(prev => !prev)} className="toggle-charts-btn">
                                {showCharts ? 'Hide Charts' : 'Show Charts'}
                            </button>
                        </div>
                    </div>

                    {lastRefreshTime && (
                        <div className="refresh-info">
                            Last updated: {lastRefreshTime.toLocaleTimeString()}
                        </div>
                    )}

                    {showCharts && workouts.length > 0 && (
                        <ProgressChart workouts={workouts} />
                    )}

                    <FilterBar onFilterChange={setFilters} />

                    {error && (
                        <div className="error-message">
                            {error}
                            <button onClick={fetchWorkouts} className="retry-btn">
                                Retry
                            </button>
                        </div>
                    )}

                    <div className="workouts-list">
                        {isLoading ? (
                            <div className="loading">Loading workouts...</div>
                        ) : (
                            <>
                                {filteredWorkouts.length > 0 ? (
                                    filteredWorkouts.map((workout) => (
                                        <WorkoutDetails
                                            key={workout._id}
                                            workout={workout}
                                            onDelete={handleDeleteWorkout}
                                            onUpdate={fetchWorkouts}
                                        />
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <p>No workouts found. Add a workout or adjust your filters.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="sidebar">
                    <WorkoutForm onWorkoutAdded={handleWorkoutAdded} />
                    <WorkoutAnalytics />
                </div>
            </div>
        </div>
    );
};

export default Home;