// Check for duplicate sample questions across all speaking practice topics
import mysql from 'mysql2/promise';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function checkDuplicateQuestions() {
    const password = await question('Enter MySQL password: ');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: password.trim(),
        database: 'quiz_generator'
    });

    console.log('\n' + '='.repeat(80));
    console.log('CHECKING FOR DUPLICATE SAMPLE QUESTIONS');
    console.log('='.repeat(80) + '\n');

    // Get all topics with their sample questions
    const [topics] = await connection.execute(`
        SELECT 
            id, 
            title, 
            difficulty_level, 
            CAST(sample_questions AS CHAR) as sample_questions 
        FROM speaking_practice_topics 
        ORDER BY id
    `);

    // Dictionary to track which topics use each question
    const questionMap = new Map();

    // Extract all questions from all topics
    for (const topic of topics) {
        const { id: topicId, title: topicTitle, sample_questions } = topic;
        
        let questions;
        try {
            // Handle if sample_questions is a Buffer
            const questionsStr = Buffer.isBuffer(sample_questions) 
                ? sample_questions.toString('utf8') 
                : sample_questions;
            questions = JSON.parse(questionsStr);
        } catch (error) {
            console.log(`⚠️  Error parsing questions for topic: ${topicTitle} - ${error.message}`);
            continue;
        }

        // Normalize and store each question
        for (const q of questions) {
            // Normalize: lowercase, trim whitespace
            const normalized = q.toLowerCase().trim();
            
            if (!questionMap.has(normalized)) {
                questionMap.set(normalized, []);
            }
            
            questionMap.get(normalized).push({
                topicId,
                topicTitle,
                originalQuestion: q
            });
        }
    }

    // Find duplicates
    let duplicatesFound = false;
    let duplicateCount = 0;

    console.log('🔍 DUPLICATE QUESTIONS FOUND:\n');

    for (const [question, usages] of questionMap.entries()) {
        if (usages.length > 1) {
            duplicatesFound = true;
            duplicateCount++;
            
            console.log(`❌ Question #${duplicateCount}: "${usages[0].originalQuestion}"`);
            console.log(`   Used in ${usages.length} topics:`);
            for (const usage of usages) {
                console.log(`   - [${usage.topicId}] ${usage.topicTitle}`);
            }
            console.log();
        }
    }

    if (!duplicatesFound) {
        console.log('✅ No duplicate questions found! All questions are unique across topics.\n');
    } else {
        console.log('\n' + '='.repeat(80));
        console.log(`SUMMARY: Found ${duplicateCount} questions that appear in multiple topics`);
        console.log('='.repeat(80) + '\n');
    }

    // Statistics
    const totalQuestions = topics.reduce((sum, t) => {
        try {
            return sum + JSON.parse(t.sample_questions).length;
        } catch {
            return sum;
        }
    }, 0);
    
    const uniqueQuestions = questionMap.size;

    console.log('\n📊 STATISTICS:');
    console.log(`   Total topics: ${topics.length}`);
    console.log(`   Total questions: ${totalQuestions}`);
    console.log(`   Unique questions: ${uniqueQuestions}`);
    console.log(`   Duplicate questions: ${duplicateCount}`);
    console.log(`   Duplication rate: ${(duplicateCount / uniqueQuestions * 100).toFixed(1)}%\n`);

    await connection.end();
    rl.close();

    return duplicatesFound;
}

checkDuplicateQuestions()
    .then(hasDuplicates => {
        process.exit(hasDuplicates ? 1 : 0);
    })
    .catch(error => {
        console.error('\n❌ Error:', error.message);
        rl.close();
        process.exit(1);
    });
