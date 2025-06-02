// frontend/src/components/WorkoutDetails.js
import { formatDistanceToNow } from 'date-fns';
import React from 'react';

const WorkoutDetails = ({ workout, onDelete, onUpdate }) => {
    // State and handler functions...
    // Removed unused isEditing state

    // Handler for toggling workout completion
    const handleToggleComplete = () => {
        if (onUpdate) {
            onUpdate({ ...workout, completed: !workout.completed });
        }
    };

    // Handler for duplicating the workout
    const handleDuplicate = () => {
        if (onUpdate) {
            // Remove unique identifiers and set createdAt to now for the duplicate
            const { _id, id, createdAt, ...rest } = workout;
            onUpdate({
                ...rest,
                title: workout.title + ' (Copy)',
                completed: false,
                createdAt: new Date().toISOString()
            }, true); // Pass a flag or handle duplication logic in parent
        }
    };

    // Handler for deleting the workout
    const handleDelete = () => {
        if (onDelete) {
            onDelete(workout._id || workout.id);
        }
    };

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
                >
                    {workout.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>

                {/* Edit button removed as isEditing state is not used */}

                <button className="duplicate-btn" onClick={handleDuplicate}>
                    Duplicate
                </button>

                <button className="delete-btn" onClick={handleDelete}>
                    Delete
                </button>
            </div>
        </div>
    );
};

export default WorkoutDetails;