# 🏋️‍♂️ Workout Tracker - MERN Stack Application

[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Features](#-features)
- [Technology Stack](#️-technology-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Installation & Setup](#-installation--setup)
- [Usage Guide](#-usage-guide)
- [Mobile Responsiveness](#-mobile-responsiveness)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Project Overview

A comprehensive full-stack workout tracking application built with the MERN stack that empowers fitness enthusiasts to create, manage, and visualize their exercise routines with powerful filtering and sorting capabilities.

### Key Highlights
- **Full CRUD Operations** for comprehensive workout management
- **Real-time Updates** using WebSocket technology
- **MongoDB Integration** for robust data persistence
- **Responsive Design** for seamless cross-device experience
- **Advanced Filtering & Sorting** for efficient workout organization


---

## ✨ Features

### 🔧 Core Functionality
- **Create Workouts** with detailed information including:
  - Exercise title and category
  - Weight load and repetitions
  - Duration tracking
  - Difficulty rating
  - Personal notes
- **Edit Existing Workouts** with real-time updates
- **Completion Tracking** with visual status indicators
- **Duplicate Workouts** for efficient routine creation
- **Delete Workouts** with confirmation prompts
- **Responsive Design** optimized for desktop and mobile

### 🚀 Advanced Features

#### 🔍 Smart Filtering System
Filter workouts by multiple criteria:
- **Category**: Strength, Cardio, Flexibility, Balance, Other
- **Status**: Completed, Incomplete
- **Difficulty**: Easy, Medium, Hard

#### 📊 Flexible Sorting Options
Sort workouts by:
- Most recent (newest first)
- Oldest first
- Title (alphabetically)
- Highest load
- Lowest load

#### 📈 Progress Visualization
- Interactive charts showing workout metrics over time
- Progress tracking with Chart.js integration
- Visual representation of fitness journey

#### ⚡ Real-time Features
- Instant updates when adding, editing, or deleting workouts
- Live data synchronization across sessions
- Persistent data storage with MongoDB

---

## 🛠️ Technology Stack

### Frontend Technologies
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | User interface library | Latest |
| **React Hooks** | State management (useState, useEffect, useContext) | - |
| **Context API** | Global state management | - |
| **CSS** | Custom responsive styling | - |
| **date-fns** | Modern date utility library | Latest |
| **Chart.js & react-chartjs-2** | Interactive data visualization | Latest |

### Backend Technologies
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | JavaScript runtime environment | v14.0+ |
| **Express** | Web framework for REST API | Latest |
| **MongoDB** | NoSQL database | Latest |
| **Mongoose** | MongoDB object modeling | Latest |
| **CORS** | Cross-Origin Resource Sharing | Latest |

### Development Tools
- **npm** - Package manager
- **nodemon** - Development server auto-restart
- **React DevTools** - Component debugging
- **MongoDB Compass** - Database management GUI

---

## 📁 Project Structure

```
workout-tracker/
├── 📁 frontend/                   # React frontend application
│   ├── 📁 public/                 # Static assets
│   └── 📁 src/                    # Source code
│       ├── 📁 components/         # Reusable React components
│       │   ├── FilterBar.js       # Workout filtering interface
│       │   ├── ProgressChart.js   # Data visualization component
│       │   ├── WorkoutDetails.js  # Individual workout display
│       │   └── WorkoutForm.js     # Create/edit workout form
│       ├── 📁 context/            # Context API state management
│       │   └── WorkoutsContext.js # Global workout state
│       ├── 📁 hooks/              # Custom React hooks
│       │   └── useWorkoutsContext.js # Context access hook
│       ├── 📁 pages/              # Page-level components
│       │   └── Home.js            # Main application page
│       ├── App.js                 # Root application component
│       └── index.js               # Application entry point
│
├── 📁 backend/                    # Node.js backend server
│   ├── 📁 controllers/            # Business logic handlers
│   │   └── workoutController.js   # Workout CRUD operations
│   ├── 📁 middleware/             # Express middleware
│   │   └── errorMiddleware.js     # Error handling logic
│   ├── 📁 models/                 # Database models
│   │   └── workoutModel.js        # Workout schema definition
│   ├── 📁 routes/                 # API route definitions
│   │   └── workouts.js            # Workout endpoint routes
│   └── server.js                  # Express server configuration
└── README.md                      # Project documentation
```

---

## 🗄️ Database Schema

The workout data model includes comprehensive fields for detailed tracking:

```javascript
{
  title: {
    type: String,
    required: true,
    trim: true
  },
  reps: {
    type: Number,
    required: true,
    min: 0
  },
  load: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['Strength', 'Cardio', 'Flexibility', 'Balance', 'Other'],
    default: 'Other'
  },
  duration: {
    type: Number,
    min: 0,
    default: 0
  },
  notes: {
    type: String,
    default: '',
    maxLength: 500
  },
  completed: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

---

## 🔌 API Endpoints

### RESTful API Routes

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `GET` | `/api/workouts` | Retrieve all workouts | - |
| `GET` | `/api/workouts/:id` | Get specific workout | - |
| `POST` | `/api/workouts` | Create new workout | Workout object |
| `PATCH` | `/api/workouts/:id` | Update existing workout | Updated fields |
| `DELETE` | `/api/workouts/:id` | Delete workout | - |

### Example API Usage

```javascript
// Create a new workout
POST /api/workouts
{
  "title": "Push-ups",
  "reps": 20,
  "load": 0,
  "category": "Strength",
  "duration": 300,
  "difficulty": "Medium",
  "notes": "Focus on proper form"
}
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v14.0 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)

### 🔧 Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jethreswar/workout-tracker.git
   cd workout-tracker/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the backend directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=4000
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

   🌐 API will be available at `http://localhost:4000`

### 🎨 Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

   🌐 Application will be available at `http://localhost:3000`

---

## 📖 Usage Guide

### Creating a New Workout
1. Fill out the workout form in the sidebar
2. Specify exercise details (title, reps, load, etc.)
3. Select category and difficulty level
4. Add optional notes
5. Click "Add Workout" to save

### Managing Existing Workouts
- **Complete Workout**: Click "Mark Complete" to toggle status
- **Edit Workout**: Click "Edit" to modify details
- **Duplicate Workout**: Click "Duplicate" for similar routines
- **Delete Workout**: Click "Delete" with confirmation

### Filtering and Sorting
1. **Apply Filters**: Use the filter bar to select:
   - Category type
   - Completion status
   - Difficulty level
2. **Sort Results**: Choose from dropdown options:
   - Most recent
   - Alphabetical
   - By load (high/low)
3. **Clear Filters**: Reset to default view

---

## 📱 Mobile Responsiveness

The application is fully optimized for mobile devices featuring:

- **Responsive Layout** that adapts to all screen sizes
- **Touch-Friendly Controls** with appropriate button sizing
- **Optimized Spacing** for comfortable mobile interactions
- **Readable Typography** without requiring zoom
- **Scalable Charts** that fit any viewport
- **Intuitive Navigation** designed for touch interfaces

---

## 🔮 Future Enhancements

### Planned Features
- [ ] **User Authentication** with personalized accounts
- [ ] **Workout Plans** with scheduled exercise routines
- [ ] **Social Features** for sharing workouts and progress
- [ ] **Exercise Library** with video demonstrations
- [ ] **Custom Categories** for personalized organization
- [ ] **Advanced Analytics** with detailed progress insights
- [ ] **Offline Functionality** with local storage sync
- [ ] **Dark Mode Theme** for improved user experience
- [ ] **Export Features** for data backup and sharing
- [ ] **Nutrition Tracking** integration
- [ ] **Goal Setting** and achievement tracking

---

## 🤝 Contributing

We welcome contributions to improve the Workout Tracker! Here's how to get started:

### Development Process
1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Contribution Guidelines
- Follow existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Workout Tracker Team**

- GitHub: [@Jethreswar](https://github.com/Jethreswar)
- Project Link: [https://github.com/Jethreswar/Workout_Bot](https://github.com/Jethreswar/Workout_Bot)

---

## 🙏 Acknowledgments

- Thanks to the MERN stack community for excellent documentation
- Chart.js team for powerful visualization tools
- MongoDB team for robust database solutions
- All open-source contributors who made this project possible

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ for the fitness community

© 2025 Workout Tracker. All rights reserved.

</div>
