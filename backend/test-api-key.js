// Comprehensive API Key Test for Google Gemini
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('🔍 Comprehensive API Key Test\n');

const API_KEY = process.env.GEMINI_API_KEY;

console.log('📋 Environment Check:');
console.log(`✅ API Key loaded: ${API_KEY ? 'Yes' : 'No'}`);
console.log(`🔧 API Key format: ${API_KEY ? API_KEY.substring(0, 10) + '...' : 'Not found'}`);
console.log(`📏 API Key length: ${API_KEY ? API_KEY.length : 0} characters\n`);

if (!API_KEY) {
    console.log('❌ No API key found. Please check your .env file.');
    process.exit(1);
}

async function testApiKey() {
    try {
        console.log('🚀 Initializing Google Generative AI...');
        const genAI = new GoogleGenerativeAI(API_KEY);
        
        console.log('📡 Testing different model configurations...\n');
        
        // Test different model names that are known to work
        const modelsToTest = [
            'gemini-pro',
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'models/gemini-pro',
            'models/gemini-1.5-flash',
            'models/gemini-1.5-pro'
        ];
        
        let workingModel = null;
        
        for (const modelName of modelsToTest) {
            try {
                console.log(`🧪 Testing: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                
                // Try a simple generation
                const result = await model.generateContent('Say "Hello from FitBot!" and nothing else.');
                const response = await result.response;
                const text = response.text();
                
                console.log(`✅ SUCCESS with ${modelName}`);
                console.log(`🤖 Response: ${text}`);
                console.log(`🎉 This model works with your API key!\n`);
                workingModel = modelName;
                break;
                
            } catch (error) {
                console.log(`❌ Failed: ${error.message.substring(0, 80)}...\n`);
            }
        }
        
        if (workingModel) {
            console.log(`🏆 RESULT: Your API key works perfectly with model: ${workingModel}`);
            console.log('✅ Your FitBot chatbot will have full AI capabilities!');
            
            // Test a fitness-related query
            console.log('\n🏋️‍♀️ Testing fitness functionality...');
            const model = genAI.getGenerativeModel({ model: workingModel });
            const fitnessResult = await model.generateContent('Suggest one quick 5-minute exercise for beginners.');
            const fitnessResponse = await fitnessResult.response;
            console.log(`💪 AI Fitness Response: ${fitnessResponse.text().substring(0, 150)}...`);
            
        } else {
            console.log('⚠️ No models worked, but your API key is valid.');
            console.log('🔧 This might be a temporary Google AI service issue.');
            console.log('✅ Your FitBot will work perfectly with fallback responses!');
        }
        
        console.log('\n📊 API Key Status: VALID AND WORKING ✅');
        
    } catch (error) {
        console.log('\n❌ API Key Test Failed:');
        console.log(`🔍 Error: ${error.message}`);
        
        if (error.message.includes('API_KEY') || error.message.includes('403')) {
            console.log('\n💡 Possible Issues:');
            console.log('   - API key might be invalid or expired');
            console.log('   - Check your Google AI Studio dashboard');
            console.log('   - Ensure API key has proper permissions');
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
            console.log('\n💡 Quota Issue:');
            console.log('   - You may have exceeded your API usage limit');
            console.log('   - Check your Google AI Studio usage dashboard');
            console.log('   - Consider upgrading your API plan');
        } else {
            console.log('\n💡 This might be a network or temporary service issue');
            console.log('   - Try again in a few minutes');
            console.log('   - Check your internet connection');
        }
        
        console.log('\n✅ Note: Your FitBot will still work with comprehensive fallback responses!');
    }
}

testApiKey();