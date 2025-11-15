# 🔧 FitBot Troubleshooting Guide

## ⚠️ "Unable to connect with the given API key"

This error occurs when the Gemini AI API key is not configured correctly or is invalid. Don't worry - **FitBot still works without an API key** using built-in fitness knowledge!

### 🎯 **Quick Fix Options**

#### **Option 1: Use FitBot Without AI (Recommended for Testing)**

FitBot has extensive built-in fitness knowledge and will work perfectly without an API key:

- ✅ Workout suggestions for all fitness levels
- ✅ Exercise form guidance for common exercises
- ✅ Progress analysis and motivation
- ✅ Workout planning and tips
- ✅ All chatbot features available

**No action needed** - just start using FitBot! The chatbot will show "🟡 Offline Mode" status.

#### **Option 2: Set Up Gemini AI (For Enhanced AI Features)**

**Step 1: Get Your API Key**

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

**Step 2: Configure Backend**

1. Navigate to your backend directory:

   ```bash
   cd backend
   ```

2. Create `.env` file (copy from example):

   ```bash
   copy .env
   ```

3. Edit `.env` file and replace the placeholder:

   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. Restart your backend server:
   ```bash
   npm start
   ```

**Step 3: Verify Connection**

- Open the chatbot
- Look for "🟢 AI Online" status in the header
- Try asking a question to test AI responses

---

## 🔍 **Troubleshooting Common Issues**

### **Issue: "🔴 Connection Error" Status**

**Possible Causes & Solutions:**

1. **Invalid API Key**

   - Double-check your API key is correct
   - Make sure there are no extra spaces
   - Try generating a new API key

2. **Network Issues**

   - Check your internet connection
   - Try refreshing the page
   - Restart the backend server

3. **API Quota Exceeded**
   - Gemini API has usage limits
   - Check your Google AI Studio dashboard
   - Consider using fallback mode temporarily

### **Issue: Chatbot Not Responding**

**Solutions:**

1. Check browser console for errors (F12)
2. Verify backend server is running on port 4000
3. Ensure frontend is connecting to correct backend URL
4. Try refreshing the page

### **Issue: "🟡 Offline Mode" - Want AI Features**

This means FitBot is using built-in responses instead of AI.

**To Enable AI:**

1. Follow "Option 2" above to configure Gemini AI
2. Restart backend server
3. Refresh the chatbot

---

## 🧪 **Testing FitBot Features**

### **Without API Key (Offline Mode)**

Try these commands to test built-in functionality:

```
"Suggest a beginner workout"
"How do I do push-ups correctly?"
"I need motivation!"
"Analyze my progress"
"Create a workout plan"
```

### **With AI Enabled**

Test advanced AI features:

```
"I have 30 minutes and only dumbbells, suggest a workout"
"Analyze my workout data and suggest improvements"
"Create a 4-week strength training program for intermediates"
```

---

## 📊 **Feature Comparison**

| Feature                  | Offline Mode               | AI Mode                             |
| ------------------------ | -------------------------- | ----------------------------------- |
| **Workout Suggestions**  | ✅ Pre-built templates     | ✅ Personalized & dynamic           |
| **Exercise Tips**        | ✅ Common exercises        | ✅ Any exercise + detailed guidance |
| **Progress Analysis**    | ✅ Basic analysis          | ✅ Detailed insights & trends       |
| **Motivation**           | ✅ Encouraging messages    | ✅ Personalized motivation          |
| **Workout Plans**        | ✅ Standard plans          | ✅ Customized programs              |
| **Natural Conversation** | ✅ Pattern-based responses | ✅ Context-aware chat               |

---

## 🔧 **Advanced Configuration**

### **Environment Variables**

Create/edit `backend/.env`:

```env
# Required for AI features
GEMINI_API_KEY=your_api_key_here

# Optional configurations
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/workout-tracker
```

### **Verify Setup**

**Check API Status:**

```bash
curl http://localhost:4000/api/chatbot/validate
```

**Expected Response (AI Working):**

```json
{
  "status": "connected",
  "message": "✅ Gemini AI is working properly!",
  "aiAvailable": true
}
```

**Expected Response (Fallback Mode):**

```json
{
  "status": "fallback_mode",
  "message": "⚠️ AI is currently unavailable, but the chatbot will still work with built-in responses!",
  "aiAvailable": false,
  "fallbackMode": true
}
```

---

## 💡 **Pro Tips**

### **For Development**

- Start with offline mode to test core functionality
- Add AI later for enhanced features
- Use browser dev tools to debug connection issues

### **For Production**

- Always set up proper API key management
- Monitor API usage and quotas
- Have fallback mode as backup

### **For Users**

- Offline mode provides excellent fitness guidance
- AI mode adds personalization and advanced features
- Both modes offer complete chatbot experience

---

## 🆘 **Still Having Issues?**

### **Quick Diagnostics**

1. **Check Backend Logs:**

   - Look for "✅ Gemini AI initialized successfully"
   - Or "⚠️ Gemini API key not configured"

2. **Check Browser Console:**

   - Open Developer Tools (F12)
   - Look for network errors or API failures

3. **Test API Endpoint:**
   ```bash
   curl http://localhost:4000/api/chatbot/status
   ```

### **Common Error Messages**

| Error                         | Meaning                     | Solution                      |
| ----------------------------- | --------------------------- | ----------------------------- |
| "API key not configured"      | No .env file or invalid key | Follow setup steps above      |
| "Failed to generate response" | Temporary AI service issue  | Use fallback mode temporarily |
| "Network error"               | Connection problem          | Check internet/server status  |
| "Quota exceeded"              | API usage limit reached     | Wait or upgrade API plan      |

---

## 🎯 **Recommended Approach**

1. **Start Simple:** Use FitBot in offline mode first
2. **Test Features:** Try all chatbot functions without AI
3. **Add AI Later:** Set up Gemini API when you want enhanced features
4. **Monitor Usage:** Keep track of API usage if using AI features

**Remember:** FitBot provides excellent fitness assistance in both modes! The built-in knowledge covers all essential fitness topics and provides a complete chatbot experience.

---

**Happy Training! 💪🤖**
