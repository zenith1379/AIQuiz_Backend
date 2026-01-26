// Script to populate speaking_practice_topics table
import pkg from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const { Sequelize } = pkg;

const sequelize = new Sequelize(
    process.env.DB_NAME || 'quiz_generator',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || 'root',
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false
    }
);

const topics = [
    { title: 'Family and Friends', description: 'Talk about your family members, relationships, and close friends', category: 'Personal', difficulty_level: 'beginner', is_active: true, sample_questions: JSON.stringify(["Tell me about your family", "Do you have any siblings?", "Who is your best friend?"]) },
    { title: 'Home and Living', description: 'Describe your home, neighborhood, and living situation', category: 'Personal', difficulty_level: 'beginner', is_active: true, sample_questions: JSON.stringify(["Describe your home", "What is your favorite room?", "Do you live in a house or apartment?"]) },
    { title: 'Shopping', description: 'Discuss shopping habits, clothing preferences, and fashion', category: 'Lifestyle', difficulty_level: 'beginner', is_active: true, sample_questions: JSON.stringify(["Do you enjoy shopping?", "What is your fashion style?", "Where do you usually shop?"]) },
    { title: 'Weather', description: 'Talk about weather, climate, and your favorite seasons', category: 'Lifestyle', difficulty_level: 'beginner', is_active: true, sample_questions: JSON.stringify(["What is the weather like today?", "What is your favorite season?", "How does weather affect you?"]) },
    { title: 'Health and Fitness', description: 'Discuss health habits, exercise, and wellness practices', category: 'Lifestyle', difficulty_level: 'intermediate', is_active: true, sample_questions: JSON.stringify(["How do you stay healthy?", "Do you exercise regularly?", "What is your diet like?"]) },
    { title: 'Education', description: 'Talk about education, learning experiences, and academic goals', category: 'Academic', difficulty_level: 'intermediate', is_active: true, sample_questions: JSON.stringify(["Tell me about your education", "What subjects do you enjoy?", "How do you prefer to learn?"]) },
    { title: 'Entertainment', description: 'Discuss movies, TV shows, music, and entertainment', category: 'Lifestyle', difficulty_level: 'intermediate', is_active: true, sample_questions: JSON.stringify(["What movies do you like?", "Do you watch TV series?", "What music do you listen to?"]) },
    { title: 'Environment', description: 'Talk about environmental issues, nature, and conservation', category: 'Social', difficulty_level: 'intermediate', is_active: true, sample_questions: JSON.stringify(["What environmental problems concern you?", "Do you recycle?", "How can we protect nature?"]) },
    { title: 'Social Media', description: 'Discuss communication methods and social media usage', category: 'Technology', difficulty_level: 'intermediate', is_active: true, sample_questions: JSON.stringify(["How do you communicate with friends?", "Do you use social media?", "How has technology changed communication?"]) },
    { title: 'Art and Culture', description: 'Talk about art, museums, and cultural activities', category: 'Culture', difficulty_level: 'intermediate', is_active: true, sample_questions: JSON.stringify(["Are you interested in art?", "Have you visited museums?", "What cultural events do you enjoy?"]) },
    { title: 'Global Issues', description: 'Discuss world problems and global challenges', category: 'Social', difficulty_level: 'advanced', is_active: true, sample_questions: JSON.stringify(["What global issues worry you?", "How can countries cooperate?", "Your opinion on climate change?"]) },
    { title: 'Career', description: 'Talk about career development and professional goals', category: 'Professional', difficulty_level: 'advanced', is_active: true, sample_questions: JSON.stringify(["What defines success?", "How do you plan your career?", "Important skills in your field?"]) },
    { title: 'Technology', description: 'Discuss innovations and technological advances', category: 'Academic', difficulty_level: 'advanced', is_active: true, sample_questions: JSON.stringify(["What breakthrough interests you?", "How does innovation affect society?", "Future of technology?"]) },
    { title: 'Business', description: 'Talk about economic systems and business practices', category: 'Professional', difficulty_level: 'advanced', is_active: true, sample_questions: JSON.stringify(["How does economy affect daily life?", "What makes a business successful?", "Discuss globalization"]) },
    { title: 'Philosophy', description: 'Discuss philosophical concepts and moral values', category: 'Academic', difficulty_level: 'advanced', is_active: true, sample_questions: JSON.stringify(["What is the meaning of happiness?", "How do you make ethical decisions?", "Discuss a moral dilemma"]) },
    { title: 'Urban Development', description: 'Talk about city development and urban planning', category: 'Social', difficulty_level: 'advanced', is_active: true, sample_questions: JSON.stringify(["How should cities develop?", "Challenges of urbanization?", "Discuss smart city concepts"]) }
];

async function addTopics() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected successfully\n');

        console.log('Adding topics...');
        
        for (const topic of topics) {
            try {
                await sequelize.query(
                    'INSERT INTO speaking_practice_topics (title, description, category, difficulty_level, is_active, sample_questions, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
                    {
                        replacements: [
                            topic.title,
                            topic.description,
                            topic.category,
                            topic.difficulty_level,
                            topic.is_active,
                            topic.sample_questions
                        ],
                        type: Sequelize.QueryTypes.INSERT
                    }
                );
                console.log(`  Added: ${topic.title}`);
            } catch (err) {
                if (err.message.includes('Duplicate entry')) {
                    console.log(`  Skipped: ${topic.title} (already exists)`);
                } else {
                    console.log(`  Failed: ${topic.title} - ${err.message}`);
                }
            }
        }

        const [results] = await sequelize.query(
            'SELECT difficulty_level, COUNT(*) as count FROM speaking_practice_topics GROUP BY difficulty_level'
        );
        
        console.log('\nTopic Summary:');
        results.forEach(row => {
            console.log(`  ${row.difficulty_level}: ${row.count} topics`);
        });

        console.log('\nDone! Refresh your Speaking Practice page.');
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

addTopics();
