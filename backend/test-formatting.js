// Test the formatting function for clean text responses
require('dotenv').config();

const fitnessAI = require('./services/geminiService.js');

async function testFormatting() {
    console.log('🧪 Testing Response Formatting for Clean Text Output\n');
    
    console.log('🔍 Checking AI availability...');
    console.log('AI Available:', fitnessAI.isAIAvailable() ? '✅ Yes' : '❌ No');
    
    console.log('\n💬 Testing chat with formatting...');
    try {
        const chatResponse = await fitnessAI.chat('Give me a quick 15-minute workout for abs');
        
        console.log('📝 Raw Response Type:', typeof chatResponse);
        console.log('📏 Response Length:', chatResponse.length);
        
        console.log('\n📋 Formatted Chat Response:');
        console.log('=' .repeat(60));
        console.log(chatResponse);
        console.log('=' .repeat(60));
        
        // Check for common formatting issues
        const hasComplexMarkdown = /\*\*\*|\#{3,}|\[.*\]\(.*\)/.test(chatResponse);
        const hasCleanFormat = !hasComplexMarkdown;
        
        console.log('\n🔍 Formatting Analysis:');
        console.log('✅ Clean Text Format:', hasCleanFormat ? 'Yes' : 'No');
        console.log('📊 Character Count:', chatResponse.length);
        console.log('📄 Line Count:', chatResponse.split('\n').length);
        
    } catch (error) {
        console.log('Chat test error:', error.message);
    }
    
    console.log('\n🏋️‍♀️ Testing workout suggestions with formatting...');
    try {
        const workoutResponse = await fitnessAI.generateWorkoutSuggestions({
            fitnessLevel: 'intermediate',
            timeAvailable: 25,
            equipment: 'dumbbells'
        });
        
        console.log('\n📋 Formatted Workout Response:');
        console.log('=' .repeat(60));
        console.log(workoutResponse);
        console.log('=' .repeat(60));
        
        // Verify readability
        const isReadable = workoutResponse.length > 50 && !workoutResponse.includes('undefined');
        console.log('\n✅ Response is readable and complete:', isReadable ? 'Yes' : 'No');
        
    } catch (error) {
        console.log('❌ Workout suggestion test error:', error.message);
    }
    
    console.log('\n🎯 Testing exercise tips with formatting...');
    try {
        const tipsResponse = await fitnessAI.getExerciseTips('push-ups');
        
        console.log('\n📋 Formatted Tips Response:');
        console.log('=' .repeat(60));
        console.log(tipsResponse);
        console.log('=' .repeat(60));
        
    } catch (error) {
        console.log('❌ Exercise tips test error:', error.message);
    }
    
    console.log('\n✨ Formatting Test Completed!');
    console.log('📋 All responses should now be in clean, readable text format.');
}

testFormatting().catch(console.error);