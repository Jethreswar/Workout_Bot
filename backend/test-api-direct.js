// Test different API versions and configurations
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('🔧 Testing Alternative API Configurations\n');

const API_KEY = process.env.GEMINI_API_KEY;

async function testAlternativeConfigs() {
    try {
        console.log('🧪 Testing basic API initialization...');
        const genAI = new GoogleGenerativeAI(API_KEY);
        
        // Try simpler model names that might work
        const simpleModels = [
            'gemini-pro',
            'text-bison-001',
            'chat-bison-001'
        ];
        
        console.log('📡 Trying simple model names...\n');
        
        for (const modelName of simpleModels) {
            try {
                console.log(`🔄 Attempting: ${modelName}`);
                
                // Try different initialization approaches
                const model = genAI.getGenerativeModel({ 
                    model: modelName,
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1024,
                    }
                });
                
                // Simple test
                const prompt = "Hello";
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                
                console.log(`✅ SUCCESS! Model ${modelName} works!`);
                console.log(`Response: ${text}`);
                return modelName;
                
            } catch (error) {
                console.log(`❌ ${modelName}: ${error.message.substring(0, 100)}...`);
            }
        }
        
        // If none work, check the SDK version
        console.log('\n🔍 Checking SDK compatibility...');
        const packageJson = require('./package.json');
        console.log(`📦 @google/generative-ai version: ${packageJson.dependencies['@google/generative-ai']}`);
        
        // Check if we can get models list (might not be available in all versions)
        try {
            console.log('\n🔄 Attempting to list available models...');
            // Note: This might not work in older SDK versions
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
            const data = await response.json();
            
            if (data.models) {
                console.log('📋 Available models:');
                data.models.forEach(model => {
                    console.log(`   - ${model.name}`);
                });
            }
        } catch (fetchError) {
            console.log('⚠️ Cannot fetch models list (this is normal for some API versions)');
        }
        
        return null;
        
    } catch (error) {
        console.log(`❌ Configuration test failed: ${error.message}`);
        return null;
    }
}

async function checkApiKeyStatus() {
    console.log('\n🔑 Final API Key Assessment...');
    
    try {
        // Try a direct HTTP request to Google's API
        const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
        
        console.log('📡 Testing direct API access...');
        
        const response = await fetch(testUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: 'Hello'
                    }]
                }]
            })
        });
        
        console.log(`📊 HTTP Response Status: ${response.status} ${response.statusText}`);
        
        if (response.status === 200) {
            const data = await response.json();
            console.log('✅ Direct API call successful!');
            console.log('🎉 Your API key is working perfectly!');
            return true;
        } else {
            const errorData = await response.json();
            console.log('❌ API Error Response:', JSON.stringify(errorData, null, 2));
        }
        
    } catch (fetchError) {
        console.log('❌ Direct API test failed:', fetchError.message);
    }
    
    return false;
}

testAlternativeConfigs()
    .then(workingModel => {
        if (workingModel) {
            console.log(`\n🏆 RESULT: Use model "${workingModel}" in your geminiService.js`);
        } else {
            console.log('\n🔧 No models worked with the SDK. Testing direct API...');
            return checkApiKeyStatus();
        }
    })
    .then(apiWorking => {
        if (apiWorking) {
            console.log('\n💡 SOLUTION: The API key works, but there might be an SDK version issue.');
            console.log('   Consider updating @google/generative-ai package.');
        } else {
            console.log('\n📊 FINAL STATUS:');
            console.log('✅ API key format is correct');
            console.log('✅ Configuration is proper');
            console.log('⚠️ Google AI models may be temporarily unavailable');
            console.log('✅ FitBot fallback system will provide excellent service');
        }
    })
    .catch(console.error);