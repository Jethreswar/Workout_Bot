// Direct test of geminiService.js
require('dotenv').config();
console.log('🧪 Testing geminiService.js directly...\n');

const fitnessAI = require('./services/geminiService.js');

async function testService() {
    console.log('🔍 Checking AI availability...');
    console.log('AI Available:', fitnessAI.isAIAvailable() ? '✅ Yes' : '❌ No');
    
    console.log('\n📡 Testing connection validation...');
    try {
        const validation = await fitnessAI.validateConnection();
        console.log('Validation Result:', JSON.stringify(validation, null, 2));
    } catch (error) {
        console.log('Validation Error:', error.message);
    }
    
    console.log('\n💬 Testing basic chat functionality...');
    try {
        const chatResponse = await fitnessAI.chat('Hello, I need a quick workout suggestion');
        console.log('Chat Response Preview:', chatResponse.substring(0, 200) + '...');
    } catch (error) {
        console.log('Chat Error:', error.message);
    }
    
    console.log('\n🏋️‍♀️ Testing workout suggestions...');
    try {
        const workoutResponse = await fitnessAI.generateWorkoutSuggestions({
            fitnessLevel: 'beginner',
            timeAvailable: 30,
            equipment: 'none'
        });
        console.log('Workout Response Preview:', workoutResponse.substring(0, 200) + '...');
    } catch (error) {
        console.log('Workout Suggestion Error:', error.message);
    }
    
    console.log('\n✨ Test completed!');
    console.log('Note: If AI is not available, fallback responses should still work perfectly! 🤖💪');
}

testService().catch(console.error);