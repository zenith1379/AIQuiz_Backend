// Test Speaking Practice API
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

// Replace with your actual token after login
const TOKEN = 'YOUR_JWT_TOKEN_HERE';

const headers = {
    'Authorization': `Bearer ${TOKEN}`
};

// Test 1: Get Topics
async function testGetTopics() {
    console.log('\n=== Test 1: Get Topics ===');
    try {
        const response = await axios.get(`${API_URL}/speaking-practice/topics`);
        console.log('✅ Topics:', response.data.topics.length, 'topics found');
        console.log('Topics:', response.data.topics.map(t => t.title));
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Test 2: Get Random Topic
async function testGetRandomTopic() {
    console.log('\n=== Test 2: Get Random Topic ===');
    try {
        const response = await axios.get(`${API_URL}/speaking-practice/topics/random?difficulty=intermediate`);
        console.log('✅ Random Topic:', response.data.topic.title);
        console.log('Description:', response.data.topic.description);
        console.log('Sample Questions:', response.data.topic.sample_questions);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Test 3: Submit Speech (requires audio file)
async function testSubmitSpeech() {
    console.log('\n=== Test 3: Submit Speech ===');
    
    // Check if test audio exists
    const audioPath = path.join(__dirname, 'test-audio.wav');
    if (!fs.existsSync(audioPath)) {
        console.log('⚠️  No test audio file found. Create a test-audio.wav file first.');
        console.log('You can record a simple "Hello, my name is..." message.');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('audio', fs.createReadStream(audioPath));
        formData.append('practiceMode', 'conversation');
        formData.append('voiceGender', 'female');
        formData.append('topic', 'Daily Routines');

        const response = await axios.post(
            `${API_URL}/speaking-practice/submit`,
            formData,
            {
                headers: {
                    ...headers,
                    ...formData.getHeaders()
                }
            }
        );

        console.log('✅ Speech analyzed successfully!');
        console.log('\n📝 Transcription:', response.data.transcription);
        console.log('\n📊 Scores:');
        console.log('  - Overall:', response.data.analysis.scores.overall);
        console.log('  - Pronunciation:', response.data.analysis.scores.pronunciation);
        console.log('  - Grammar:', response.data.analysis.scores.grammar);
        console.log('  - Fluency:', response.data.analysis.scores.fluency);
        console.log('  - Vocabulary:', response.data.analysis.scores.vocabulary);

        if (response.data.analysis.pronunciationErrors.length > 0) {
            console.log('\n🗣️  Pronunciation Errors:');
            response.data.analysis.pronunciationErrors.forEach(error => {
                console.log(`  - "${error.word}": ${error.incorrect} → ${error.correct}`);
            });
        }

        if (response.data.analysis.grammarErrors.length > 0) {
            console.log('\n📚 Grammar Errors:');
            response.data.analysis.grammarErrors.forEach(error => {
                console.log(`  - ${error.error} → ${error.correction}`);
            });
        }

        console.log('\n👨‍🏫 Teacher Response:', response.data.teacherResponse.text);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Test 4: Get Practice History
async function testGetHistory() {
    console.log('\n=== Test 4: Get Practice History ===');
    try {
        const response = await axios.get(`${API_URL}/speaking-practice/history`, { headers });
        console.log('✅ History loaded');
        console.log('Total sessions:', response.data.statistics.total_sessions);
        console.log('Average score:', response.data.statistics.avg_score?.toFixed(2));
        console.log('Total time:', Math.round(response.data.statistics.total_time_seconds / 60), 'minutes');
        
        if (response.data.sessions.length > 0) {
            console.log('\nRecent sessions:');
            response.data.sessions.slice(0, 3).forEach(session => {
                console.log(`  - ${session.practice_mode} | Score: ${session.overall_score} | ${new Date(session.created_at).toLocaleDateString()}`);
            });
        }
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Test 5: Quick Conversation (text-only)
async function testQuickConversation() {
    console.log('\n=== Test 5: Quick Conversation ===');
    try {
        const response = await axios.post(
            `${API_URL}/speaking-practice/conversation`,
            {
                text: 'Hello! What should I do to improve my English speaking?',
                conversationHistory: [],
                voiceGender: 'female'
            },
            { headers }
        );

        console.log('✅ Teacher Response:', response.data.response.text);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Speaking Practice API Tests...\n');
    console.log('API URL:', API_URL);
    
    if (TOKEN === 'YOUR_JWT_TOKEN_HERE') {
        console.log('\n⚠️  WARNING: Please set your JWT token in the script first!');
        console.log('To get token:');
        console.log('1. Login to the app');
        console.log('2. Open browser console (F12)');
        console.log('3. Type: localStorage.getItem("token")');
        console.log('4. Copy the token and paste it in this script\n');
    }

    await testGetTopics();
    await testGetRandomTopic();
    
    if (TOKEN !== 'YOUR_JWT_TOKEN_HERE') {
        await testQuickConversation();
        await testSubmitSpeech();
        await testGetHistory();
    }

    console.log('\n✅ All tests completed!');
}

// Run tests
runAllTests().catch(console.error);
