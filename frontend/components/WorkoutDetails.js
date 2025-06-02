import { useState } from 'react';
import { useWorkoutsContext } from '../hooks/useWorkoutsContext';
import { formatDistanceToNow } from 'date-fns';
import WorkoutForm from './WorkoutForm';

const WorkoutDetails = ({ workout, onDelete, onUpdate }) => {
    const { dispatch } = useWorkoutsContext();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);

    // Toggle completed status
    const handleToggleComplete = async () => {
        setIsUpdating(true);

        try {
            const response = await fetch(`/api/workouts/${workout._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    completed: !workout.completed
                })
            });

            if (response.ok) {
                const updatedWorkout = await response.json();

                // Update context
                dispatch({ type: 'UPDATE_WORKOUT', payload: updatedWorkout });

                // Notify parent
                if (onUpdate) onUpdate(updatedWorkout);
            } else {
                console.error('Failed to update workout status');
            }
        } catch (error) {
            console.error('Error updating workout:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Delete workout
    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            const response = await fetch(`/api/workouts/${workout._id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Update context
                dispatch({ type: 'DELETE_WORKOUT', payload: workout });

                // Notify parent
                if (onDelete) onDelete(workout._id);
            } else {
                console.error('Failed to delete workout');
            }
        } catch (error) {
            console.error('Error deleting workout:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Duplicate workout
    const handleDuplicate = async () => {
        setIsDuplicating(true);

        try {
            // Create new workout with same details but without the _id
            const { _id, createdAt, updatedAt, ...workoutData } = workout;

            // Add "(Copy)" to the title
            workoutData.title = `${workoutData.title} (Copy)`;

            const response = await fetch('/api/workouts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(workoutData)
            });

            if (response.ok) {
                const newWorkout = await response.json();

                // Update context
                dispatch({ type: 'CREATE_WORKOUT', payload: newWorkout });

                // Notify parent if needed
                if (onUpdate) onUpdate(newWorkout);
            } else {
                console.error('Failed to duplicate workout');
            }
        } catch (error) {
            console.error('Error duplicating workout:', error);
        } finally {
            setIsDuplicating(false);
        }
    };

    // Handle form submission from edit mode
    const handleEditSubmit = async (updatedData) => {
        try {
            const response = await fetch(`/api/workouts/${workout._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                const updatedWorkout = await response.json();

                // Update context
                dispatch({ type: 'UPDATE_WORKOUT', payload: updatedWorkout });

                // Notify parent
                if (onUpdate) onUpdate(updatedWorkout);

                // Exit edit mode
                setIsEditing(false);
            } else {
                console.error('Failed to update workout');
            }
        } catch (error) {
            console.error('Error updating workout:', error);
        }
    };

    // If in edit mode, show the form instead
    if (isEditing) {
        return (
            <div className="edit-workout-container">
                <h3>Edit Workout</h3>
                <WorkoutForm
                    initialData={workout}
                    submitText="Update Workout"
                    onSubmit={handleEditSubmit}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        );
    }

    // Otherwise show the normal workout details view
    return (
        <div className={`workout-details ${workout.completed ? 'completed' : ''}`}>
            <h4>{workout.title}</h4>

            <div className="workout-info">
                <p><strong>Load (kg): </strong>{workout.load}</p>
                <p><strong>Reps: </strong>{workout.reps}</p>
                <p><strong>Category: </strong>{workout.category || 'Other'}</p>
                {workout.duration > 0 && <p><strong>Duration: </strong>{workout.duration} min</p>}
                {workout.notes && <p><strong>Notes: </strong>{workout.notes}</p>}
                <p><strong>Difficulty: </strong>{workout.difficulty || 'Medium'}</p>
                <p className="workout-status">
                    <strong>Status: </strong>
                    <span className={workout.completed ? 'completed-tag' : 'incomplete-tag'}>
                        {workout.completed ? 'Completed' : 'Incomplete'}
                    </span>
                </p>
                <p className="workout-date">
                    {workout.createdAt && formatDistanceToNow(new Date(workout.createdAt), { addSuffix: true })}
                </p>
            </div>

            <div className="workout-actions">
                <button
                    className={`complete-btn ${workout.completed ? 'uncomplete' : 'complete'}`}
                    onClick={handleToggleComplete}
                    disabled={isUpdating}
                >
                    {isUpdating ? 'Updating...' : (workout.completed ? 'Mark as Incomplete' : 'Mark as Complete')}
                </button>

                <button
                    className="edit-btn"
                    onClick={() => setIsEditing(true)}
                >
                    Edit
                </button>

                <button
                    className="duplicate-btn"
                    onClick={handleDuplicate}
                    disabled={isDuplicating}
                >
                    {isDuplicating ? 'Duplicating...' : 'Duplicate'}
                </button>

                <button
                    className="delete-btn"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    );
};

export default WorkoutDetails;