// Test Gemini API Connection
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('🔍 Testing Gemini API Connection...\n');

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.log('❌ No API key found in environment variables');
    process.exit(1);
}

console.log(`✅ API Key loaded: ${API_KEY.substring(0, 10)}...`);
console.log(`🔧 API Key length: ${API_KEY.length} characters`);

async function testConnection() {
    try {
        console.log('\n🚀 Initializing Google Generative AI...');
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        console.log('✅ Model initialized successfully');
        
        console.log('\n📡 Testing API connection with a simple request...');
        const result = await model.generateContent('Say "Hello, FitBot connection test successful!" and nothing else.');
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ Connection successful!');
        console.log('🤖 AI Response:', text);
        
        console.log('\n🎉 Gemini API is working perfectly with your key!');
        console.log('💪 Your FitBot chatbot should now have full AI capabilities!');
        
    } catch (error) {
        console.log('\n❌ Connection failed:');
        console.log('🔍 Error type:', error.constructor.name);
        console.log('📋 Error message:', error.message);
        
        if (error.message.includes('API_KEY')) {
            console.log('\n💡 Suggestions:');
            console.log('   1. Verify your API key is correct');
            console.log('   2. Check if your API key has proper permissions');
            console.log('   3. Ensure your Google AI Studio account is active');
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
            console.log('\n💡 This appears to be a quota/usage limit issue');
            console.log('   - Check your API usage limits in Google AI Studio');
            console.log('   - Your FitBot will still work with built-in responses');
        } else {
            console.log('\n💡 This might be a temporary network or service issue');
            console.log('   - Try again in a few minutes');
            console.log('   - Your FitBot has fallback responses and will still work');
        }
    }
}

testConnection();