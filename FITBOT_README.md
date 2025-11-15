# 🤖 FitBot - AI-Powered Workout Assistant

FitBot is an intelligent chatbot integrated into your MERN stack workout tracker, powered by Google's Gemini AI. It provides personalized fitness guidance, workout suggestions, progress analysis, and motivational support.

## 🚀 Features

### 💬 **Conversational AI Assistant**

- Natural language conversations about fitness and health
- Contextual responses based on your workout history
- Motivational support and encouragement
- 24/7 availability for fitness questions

### 🏋️ **Personalized Workout Suggestions**

- Custom workout recommendations based on:
  - Fitness level (beginner, intermediate, advanced)
  - Available equipment
  - Time constraints
  - Fitness goals
  - Previous workout patterns

### 📊 **Intelligent Progress Analysis**

- AI-powered analysis of your workout trends
- Completion rate insights
- Calorie burn patterns
- Strength and endurance progression
- Personalized improvement recommendations

### 🎯 **Exercise Form & Safety Guidance**

- Detailed exercise instructions
- Common mistakes to avoid
- Safety tips and modifications
- Beginner-friendly alternatives
- Advanced variations for progression

### 📅 **Custom Workout Plan Creation**

- Structured workout programs
- Progressive overload strategies
- Recovery and rest day guidance
- Goal-specific training plans

## 🛠️ Setup Instructions

### 1. **Get Gemini AI API Key**

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key for the next step

### 2. **Backend Configuration**

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create environment file:

   ```bash
   cp .env.example .env
   ```

3. Edit `.env` file and add your Gemini AI API key:

   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. Install dependencies (if not already done):

   ```bash
   npm install
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

### 3. **Frontend Setup**

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies (if not already done):

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## 🎮 How to Use FitBot

### **Accessing the Chatbot**

- Look for the floating 🤖 button in the bottom-right corner of your screen
- Click the button to open the chat window
- The chatbot will greet you with a welcome message

### **Chat Interface Features**

- **Quick Actions**: Use pre-built buttons for common requests
  - 💪 Workout Tips
  - 📊 My Progress
  - ❓ Help
- **Text Input**: Type natural language questions or requests
- **Conversation History**: The bot remembers context within each session

### **Example Conversations**

#### **Getting Workout Suggestions**

```
You: "I have 30 minutes and want to build strength"
FitBot: "Great! Here's a perfect 30-minute strength routine for you:
1. Bodyweight Squats (3 sets × 12 reps)
2. Push-ups (3 sets × 8-10 reps)
3. Planks (3 sets × 30 seconds)
..."
```

#### **Exercise Form Questions**

```
You: "How do I do push-ups correctly?"
FitBot: "Perfect form for push-ups:
🎯 Proper Form:
- Start in plank position...
⚠️ Common Mistakes:
- Don't let hips sag...
🛡️ Safety Tips:
- Keep core engaged..."
```

#### **Progress Analysis**

```
You: "How am I doing with my workouts?"
FitBot: "Looking at your progress - fantastic work! 🎉
📈 Highlights:
- 85% completion rate (up 15% from last month!)
- 1,250 calories burned this month
- Consistent strength training 3x/week
💪 Recommendations:
- Try increasing weights by 5-10%
- Add 1 cardio session for balanced fitness..."
```

### **AI Analytics Panel**

Located in the sidebar, this panel provides:

- **📊 AI Analysis**: Click to get detailed progress insights
- **💡 Get Suggestions**: Receive personalized workout recommendations
- **Statistics Overview**: Visual representation of your fitness data

## 🎯 Available Commands & Features

### **Workout-Related Queries**

- "Suggest a beginner workout"
- "I have dumbbells and 20 minutes"
- "Full body strength routine"
- "Cardio for weight loss"
- "Exercises for back pain"

### **Exercise Guidance**

- "How to do [exercise name]?"
- "Proper squat form"
- "Push-up modifications for beginners"
- "Deadlift safety tips"

### **Progress & Motivation**

- "Analyze my progress"
- "How am I doing?"
- "I need motivation"
- "What should I improve?"
- "Am I on track with my goals?"

### **Workout Planning**

- "Create a 4-week program"
- "Beginner fitness plan"
- "Strength training routine"
- "Home workout without equipment"

### **Nutrition & Recovery**

- "Pre-workout nutrition"
- "Post-workout meal ideas"
- "How much protein do I need?"
- "Recovery tips"
- "Hydration guidelines"

## 🛡️ Privacy & Data

### **Data Usage**

- Your workout data is used only to provide personalized recommendations
- Conversations are not stored permanently
- No personal data is shared with third parties

### **API Key Security**

- Keep your Gemini API key secure
- Never commit `.env` files to version control
- Regularly rotate your API keys for security

## 🔧 Technical Details

### **Backend Architecture**

```
backend/
├── services/
│   └── geminiService.js      # AI service integration
├── controllers/
│   └── chatbotController.js  # API endpoints
└── routes/
    └── chatbot.js           # Route definitions
```

### **API Endpoints**

- `POST /api/chatbot/chat` - General conversation
- `POST /api/chatbot/suggestions` - Workout suggestions
- `GET /api/chatbot/analyze` - Progress analysis
- `GET /api/chatbot/exercise-tips/:exercise` - Exercise guidance
- `POST /api/chatbot/workout-plan` - Create workout plans
- `GET /api/chatbot/help` - Get capabilities

### **Frontend Components**

- `ChatBot.js` - Main chat interface
- `WorkoutAnalytics.js` - AI analytics panel
- Floating button with animations
- Real-time message updates

## 🎨 Customization

### **Modifying AI Personality**

Edit `backend/services/geminiService.js` to customize the AI's personality and responses.

### **Adding New Features**

1. Add new methods to `geminiService.js`
2. Create corresponding endpoints in `chatbotController.js`
3. Add routes in `chatbot.js`
4. Update frontend components as needed

### **Styling Customization**

Modify `ChatBot.css` to change the appearance of the chat interface.

## 🚨 Troubleshooting

### **Common Issues**

**"API Key Error"**

- Ensure your Gemini API key is correct in `.env`
- Check that the API key has proper permissions
- Verify the `.env` file is in the backend directory

**"Chat Not Responding"**

- Check backend server is running
- Verify internet connection
- Look at browser console for errors

**"Analytics Not Working"**

- Ensure you have workout data logged
- Check if backend is connected to MongoDB
- Verify API endpoints are accessible

### **Debug Mode**

Check browser console and backend logs for detailed error messages.

## 📱 Mobile Support

FitBot is fully responsive and works great on:

- 📱 Mobile phones
- 📟 Tablets
- 💻 Desktop computers

The chat interface automatically adapts to screen size.

## 🌟 Pro Tips

1. **Be Specific**: The more details you provide, the better the recommendations
2. **Use Context**: Reference your previous workouts for personalized advice
3. **Ask Follow-ups**: Don't hesitate to ask for clarification or modifications
4. **Regular Check-ins**: Use progress analysis weekly to track improvements
5. **Explore Features**: Try different types of questions to discover all capabilities

## 🤝 Support

If you encounter any issues:

1. Check this documentation
2. Look at the troubleshooting section
3. Check the browser console for errors
4. Verify your API key setup

---

**Happy Training! 💪🤖**
