// List Available Gemini Models
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('🔍 Listing Available Gemini Models...\n');

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.log('❌ No API key found in environment variables');
    process.exit(1);
}

async function listModels() {
    try {
        console.log('🚀 Initializing Google Generative AI...');
        const genAI = new GoogleGenerativeAI(API_KEY);
        
        console.log('📡 Fetching available models...\n');
        
        // Try to list models
        const models = await genAI.listModels();
        
        console.log('✅ Available models:');
        models.forEach((model, index) => {
            console.log(`${index + 1}. ${model.name}`);
            console.log(`   - Display Name: ${model.displayName}`);
            console.log(`   - Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
            console.log('');
        });
        
    } catch (error) {
        console.log('\n❌ Failed to list models:');
        console.log('🔍 Error type:', error.constructor.name);
        console.log('📋 Error message:', error.message);
        
        console.log('\n🔧 Let\'s try some common model names instead...');
        
        // Try common model names
        const genAI = new GoogleGenerativeAI(API_KEY); // Recreate genAI for testing
        const commonModels = [
            'gemini-pro',
            'gemini-1.5-pro', 
            'gemini-1.5-flash',
            'gemini-1.0-pro',
            'models/gemini-pro',
            'models/gemini-1.5-pro',
            'models/gemini-1.5-flash'
        ];
        
        for (const modelName of commonModels) {
            try {
                console.log(`\n🧪 Testing model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Hello');
                const response = await result.response;
                console.log(`✅ ${modelName} works!`);
                console.log(`🤖 Response: ${response.text().substring(0, 50)}...`);
                break; // Stop at first working model
            } catch (testError) {
                console.log(`❌ ${modelName} failed: ${testError.message.substring(0, 100)}...`);
            }
        }
    }
}

listModels();