// frontend/src/components/WorkoutForm.js
import { useState } from 'react';

const WorkoutForm = ({ onWorkoutAdded }) => {
    // State and handler functions...
    const [formData, setFormData] = useState({
        title: '',
        category: 'Strength',
        // Add other fields as needed
    });
    const [error] = useState(null);
    const [success] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // You may also need to define handleSubmit if not already present
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Simulate API call or add your API logic here
            // Example: await api.addWorkout(formData);
            if (onWorkoutAdded) {
                onWorkoutAdded(formData);
            }
            // Optionally set success state here
        } catch (err) {
            // Optionally set error state here
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="create" onSubmit={handleSubmit}>
            <h3>Add a New Workout</h3>

            <div className="form-group">
                <label>Exercise Title: *</label>
                <input
                    type="text"
                    name="title"
                    onChange={handleChange}
                    value={formData.title}
                    required
                />
            </div>

            <div className="form-group">
                <label>Category:</label>
                <select name="category" onChange={handleChange} value={formData.category}>
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Balance">Balance</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            {/* More form fields... */}

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" className="submit-button">
                {isSubmitting ? 'Adding...' : 'Add Workout'}
            </button>
        </form>
    );
};

export default WorkoutForm;