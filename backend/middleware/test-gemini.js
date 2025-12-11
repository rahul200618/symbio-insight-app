// Quick test script to debug Gemini API
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    console.log('🔍 Testing Gemini API...');
    console.log('API Key configured:', !!process.env.GEMINI_API_KEY);
    console.log('API Key length:', process.env.GEMINI_API_KEY?.length);

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        console.log('\n📤 Sending test request...');
        const result = await model.generateContent('Say hello in one sentence.');
        const response = await result.response;
        const text = response.text();

        console.log('\n✅ SUCCESS!');
        console.log('Response:', text);
    } catch (error) {
        console.error('\n❌ ERROR:');
        console.error('Message:', error.message);
        console.error('Status:', error.status);
        console.error('Details:', JSON.stringify(error, null, 2));
    }
}

testGemini();
