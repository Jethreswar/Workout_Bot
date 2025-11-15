import { useState, useEffect } from 'react';
import { useWorkoutsContext } from '../hooks/useWorkoutsContext';
import { calculateCalories, formatCalories, getCalorieIntensity } from '../utils/calorieCalculator';
import './Workout_Style.css';

const WorkoutForm = ({ initialData, onSubmit, onCancel, submitText = 'Add Workout', onWorkoutAdded }) => {
    const { dispatch } = useWorkoutsContext();
    const isEditMode = !!initialData;

    // Default form data
    const defaultFormData = {
        title: '',
        load: '',
        reps: '',
        category: 'Strength',
        duration: '',
        notes: '',
        completed: false,
        difficulty: 'Medium'
    };

    // Initialize with provided data or defaults
    const [formData, setFormData] = useState(initialData || defaultFormData);
    const [error, setError] = useState(null);
    const [emptyFields, setEmptyFields] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [estimatedCalories, setEstimatedCalories] = useState(0);

    // Update form when initialData changes (for edit mode)
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    // Calculate calories in real-time as form data changes
    useEffect(() => {
        const calories = calculateCalories({
            category: formData.category,
            difficulty: formData.difficulty,
            duration: Number(formData.duration) || 0,
            load: Number(formData.load) || 0,
            reps: Number(formData.reps) || 0
        });
        setEstimatedCalories(calories);
    }, [formData.category, formData.difficulty, formData.duration, formData.load, formData.reps]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess('');

        // Convert string values to numbers
        const dataToSubmit = {
            ...formData,
            load: formData.load === '' ? 0 : Number(formData.load),
            reps: formData.reps === '' ? 0 : Number(formData.reps),
            duration: formData.duration === '' ? 0 : Number(formData.duration)
        };

        // If in edit mode, use the provided onSubmit function
        if (isEditMode && onSubmit) {
            await onSubmit(dataToSubmit);
            setIsSubmitting(false);
            return;
        }

        // Otherwise, create a new workout
        try {
            console.log('Submitting workout data:', formData);

            const response = await fetch('/api/workouts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSubmit)
            });

            const json = await response.json();

            if (!response.ok) {
                console.error('Error response from server:', json);
                setError(json.error || 'Failed to add workout');
                setEmptyFields(json.emptyFields || []);
            } else {
                console.log('Workout added successfully:', json);

                // Reset form on success
                setFormData(defaultFormData);
                setEmptyFields([]);
                setSuccess('Workout added successfully!');

                // Update context
                dispatch({ type: 'CREATE_WORKOUT', payload: json });

                // Call callback if provided
                if (onWorkoutAdded) onWorkoutAdded(json);
            }
        } catch (err) {
            console.error('Network error:', err);
            setError('Network error - please check your connection and try again');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="workout-form" onSubmit={handleSubmit}>
            {!isEditMode && <h3>Add a New Workout</h3>}

            <div className="form-group">
                <label>Exercise Title:</label>
                <input
                    type="text"
                    name="title"
                    onChange={handleChange}
                    value={formData.title}
                    className={emptyFields.includes('title') ? 'error' : ''}
                    disabled={isSubmitting}
                    required
                />
            </div>

            <div className="form-group">
                <label>Category:</label>
                <select
                    name="category"
                    onChange={handleChange}
                    value={formData.category}
                    disabled={isSubmitting}
                >
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Balance">Balance</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Load (kg):</label>
                    <input
                        type="number"
                        name="load"
                        onChange={handleChange}
                        value={formData.load}
                        className={emptyFields.includes('load') ? 'error' : ''}
                        min="0"
                        disabled={isSubmitting}
                    />
                </div>

                <div className="form-group">
                    <label>Reps:</label>
                    <input
                        type="number"
                        name="reps"
                        onChange={handleChange}
                        value={formData.reps}
                        className={emptyFields.includes('reps') ? 'error' : ''}
                        min="0"
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Difficulty:</label>
                <select
                    name="difficulty"
                    onChange={handleChange}
                    value={formData.difficulty}
                    disabled={isSubmitting}
                >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
            </div>

            <div className="form-group">
                <label>Duration (minutes):</label>
                <input
                    type="number"
                    name="duration"
                    onChange={handleChange}
                    value={formData.duration}
                    min="0"
                    disabled={isSubmitting}
                />
            </div>

            <div className="form-group">
                <label>Notes:</label>
                <textarea
                    name="notes"
                    onChange={handleChange}
                    value={formData.notes}
                    disabled={isSubmitting}
                    rows="3"
                />
            </div>

            <div className="form-group checkbox">
                <label>
                    <input
                        type="checkbox"
                        name="completed"
                        checked={formData.completed}
                        onChange={handleChange}
                        disabled={isSubmitting}
                    />
                    Mark as completed
                </label>
            </div>

            {/* Calorie Estimation Display */}
            <div className="calorie-preview">
                <div className="calorie-info">
                    <span className="calorie-label">Estimated Calories:</span>
                    <span className="calorie-value">{formatCalories(estimatedCalories)}</span>
                    <span className="calorie-intensity">
                        ({getCalorieIntensity(estimatedCalories, Number(formData.duration) || 0)} Intensity)
                    </span>
                </div>
                <div className="calorie-note">
                    <small>* This is an estimate based on workout type, intensity, and duration</small>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-buttons">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="submit-button"
                >
                    {isSubmitting ? 'Saving...' : submitText}
                </button>

                {isEditMode && onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="cancel-button"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

export default WorkoutForm;