// Description: This is the main entry point for the backend server of a workout application.
import { createContext, useReducer } from 'react';

export const WorkoutsContext = createContext();

export const workoutsReducer = (state, action) => {
    switch (action.type) {
        case 'SET_WORKOUTS':
            return {
                ...state,
                workouts: Array.isArray(action.payload) ? action.payload : []
            };
        case 'CREATE_WORKOUT':
            return {
                ...state,
                workouts: [action.payload, ...(Array.isArray(state.workouts) ? state.workouts : [])]
            };
        case 'DELETE_WORKOUT':
            return {
                ...state,
                workouts: Array.isArray(state.workouts)
                    ? state.workouts.filter(w => w._id !== action.payload._id)
                    : []
            };
        case 'UPDATE_WORKOUT':
            return {
                ...state,
                workouts: Array.isArray(state.workouts)
                    ? state.workouts.map(w => w._id === action.payload._id ? action.payload : w)
                    : []
            };
        default:
            return state;
    }
};

export const WorkoutsContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(workoutsReducer, {
        workouts: [] // Initialize with empty array
    });

    return (
        <WorkoutsContext.Provider value={{
            ...state,
            dispatch
        }}>
            {children}
        </WorkoutsContext.Provider>
    );
};