// MongoDB initialization script for Docker containers
db = db.getSiblingDB('workout_tracker');

// Create collections
db.createCollection('workouts');

// Create indexes for better performance
db.workouts.createIndex({ "createdAt": -1 });
db.workouts.createIndex({ "category": 1 });
db.workouts.createIndex({ "completed": 1 });
db.workouts.createIndex({ "title": "text", "notes": "text" });

// Insert sample data for development
db.workouts.insertMany([
  {
    title: "Morning Push-ups",
    reps: 20,
    load: 0,
    category: "Strength",
    duration: 300,
    notes: "Standard push-ups focusing on form",
    completed: true,
    difficulty: "Medium",
    createdAt: new Date("2024-01-15T08:00:00Z"),
    updatedAt: new Date("2024-01-15T08:00:00Z")
  },
  {
    title: "Evening Run",
    reps: 1,
    load: 0,
    category: "Cardio",
    duration: 1800,
    notes: "5km run around the neighborhood",
    completed: true,
    difficulty: "Hard",
    createdAt: new Date("2024-01-15T18:00:00Z"),
    updatedAt: new Date("2024-01-15T18:00:00Z")
  },
  {
    title: "Yoga Session",
    reps: 1,
    load: 0,
    category: "Flexibility",
    duration: 2400,
    notes: "Morning yoga routine for flexibility",
    completed: false,
    difficulty: "Easy",
    createdAt: new Date("2024-01-16T07:00:00Z"),
    updatedAt: new Date("2024-01-16T07:00:00Z")
  },
  {
    title: "Weight Training",
    reps: 12,
    load: 50,
    category: "Strength",
    duration: 2700,
    notes: "Bench press and squats session",
    completed: false,
    difficulty: "Hard",
    createdAt: new Date("2024-01-16T16:00:00Z"),
    updatedAt: new Date("2024-01-16T16:00:00Z")
  }
]);

// Create user (if you plan to add authentication)
db.createCollection('users');
db.users.createIndex({ "email": 1 }, { unique: true });

print("Database initialization completed successfully!");
print("Collections created: workouts, users");
print("Sample workouts inserted: " + db.workouts.countDocuments());
print("Indexes created for performance optimization");

// Create admin user for development
db.createUser({
  user: "workout_admin",
  pwd: "admin_password",
  roles: [
    { role: "readWrite", db: "workout_tracker" }
  ]
});

print("Admin user created: workout_admin");