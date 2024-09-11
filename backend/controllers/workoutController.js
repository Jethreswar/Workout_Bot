const Workout = require('../models/workoutModel');
const mongoose = require('mongoose');

// get all workouts
const getWorkouts = async (req, res) => {
    try {
        const workouts = await Workout.find({}).sort({createdAt: -1}); // Find all workouts and sort them by createdAt in descending order
        res.status(200).json(workouts); // Gives status 200 and returns the workouts
    } catch (error) {
        res.status(400).json({error: error.message}); // Gives status 400 and returns the error message
    }
}

// get a single workout
const getWorkout = async (req, res) => {
    const {id} = req.params; // Destructure id from req.params

    if (!mongoose.Types.ObjectId.isValid(id)) { // Check if id is not a valid ObjectId
        return res.status(404).json({error: 'No such Workout'}); // Gives status 404 and returns an error message

    }
    const workout = await Workout.findById(id); // Find a workout by id

    if (!workout) {
        res.status(404).json({error: 'Workout not found'}); // Gives status 404 and returns an error message
    }
    res.status(200).json(workout); // Gives status 200 and returns the workout
}
// create a workout
const createWorkout = async (req, res) => {
    const {title, load, reps} = req.body; // Destructure title, reps, and load from req.body

    let emptyFields = []; // Create an empty array to store empty fields

    if (!title) {
        emptyFields.push('title'); // Push the field name into the array
    }
    if (!load) {
        emptyFields.push('load'); // Push the field name into the array
    }
    if (!reps) {
        emptyFields.push('reps'); // Push the field name into the array
    }
    if (emptyFields.length > 0) {
        return res.status(400).json({error: 'Please fill in all the fields!', emptyFields}) // Gives status 400 and returns an error message
    }

    try {
        const workout = await Workout.create({title, load, reps}); // Create a new workout
        res.status(200).json(workout); // Gives status 200 and returns the workout
    } catch (error) {
        res.status(400).json({error: error.message}); // Gives status 400 and returns the error message
    }
}

// delete a workout
const deleteWorkout = async (req, res) => {
    const {id} = req.params; // Destructure id from req.params

    if (!mongoose.Types.ObjectId.isValid(id)) { // Check if id is not a valid ObjectId
        return res.status(404).json({error: 'No such Workout'}); // Gives status 404 and returns an error message
    }

    const workout = await Workout.findOneAndDelete({_id: id}); // Find a workout by id and delete it

    if (!workout) {
        return res.status(400).json({error: 'Workout does not exist'}); // Gives status 400 and returns an error message
    }

    res.status(200).json(workout); // Returns a success message

}

// update a workout
const updateWorkout = async (req, res) => {
    const {id} = req.params; // Destructure id from req.params

    if (!mongoose.Types.ObjectId.isValid(id)) { // Check if id is not a valid ObjectId
        return res.status(400).json({error: 'No such Workout'}); // Gives status 400 and returns an error message
    }

    const workout = await Workout.findOneAndUpdate({_id: id}, {
        ...req.body
    });

    if (!workout) {
        return res.status(400).json({error: 'Workout does not exist'}); // Gives status 400 and returns an error message
    }

    res.status(200).json(workout); // Returns a success message
}

module.exports = {
    createWorkout,
    getWorkouts,
    getWorkout,
    deleteWorkout,
    updateWorkout
}