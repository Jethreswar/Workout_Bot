require('dotenv').config(); // Import dotenv

const express = require('express'); // Import express
const mongoose = require('mongoose'); // Import mongoose

const workoutRoutes = require('./routes/workouts'); // Import workout routes

const app = express(); // Initialize express

// Middleware
app.use(express.json()); // Parse JSON bodies

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// Routes
app.use('/api/workouts', workoutRoutes); // Use workout routes

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    // Listen to port
app.listen(process.env.PORT, () => {
    console.log('Connected to database & Listening on port', process.env.PORT);
})
})
.catch((error) => {
    console.log(error)
})

/* app.get('/', (req, res) => {
    res.json({mssg: 'Hello World!'})
}) */