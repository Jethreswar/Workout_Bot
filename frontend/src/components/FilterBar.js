import { useState, useEffect } from 'react';

const FilterBar = ({ onFilterChange }) => {
    const [filters, setFilters] = useState({
        category: '',
        status: '',
        difficulty: '',
        sortBy: 'newest'
    });

    // Update parent component when filters change
    useEffect(() => {
        if (onFilterChange) {
            onFilterChange(filters);
        }
    }, [filters, onFilterChange]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        // Update the specific filter
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));

        console.log(`Filter changed: ${name} = ${value}`);
    };

    const clearFilters = () => {
        // Reset all filters to default values
        setFilters({
            category: '',
            status: '',
            difficulty: '',
            sortBy: 'newest'
        });

        console.log('Filters cleared');
    };

    return (
        <div className="filter-bar">
            <div className="filter-group">
                <label>Category:</label>
                <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                >
                    <option value="">All Categories</option>
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Flexibility">Flexibility</option>
                    <option value="Balance">Balance</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Status:</label>
                <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                >
                    <option value="">All</option>
                    <option value="completed">Completed</option>
                    <option value="incomplete">Incomplete</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Difficulty:</label>
                <select
                    name="difficulty"
                    value={filters.difficulty}
                    onChange={handleFilterChange}
                >
                    <option value="">All Levels</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Sort By:</label>
                <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                >
                    <option value="newest">Most Recent</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Title (A-Z)</option>
                    <option value="highLoad">Highest Load</option>
                    <option value="lowLoad">Lowest Load</option>
                </select>
            </div>

            <button
                className="clear-filters-btn"
                onClick={clearFilters}
            >
                Clear Filters
            </button>
        </div>
    );
};

export default FilterBar;