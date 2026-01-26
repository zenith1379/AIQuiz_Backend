// Speaking Practice Controller
import speakingPracticeService from '../services/speakingPracticeService.js';
import { SpeakingPracticeSession } from '../models/index.js';
import sequelize from '../config/sequelize.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { Op } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SpeakingPracticeController {
    /**
     * Handle speech submission: upload audio, transcribe, analyze
     */
    async submitSpeech(req, res) {
        try {
            const userId = req.user.id;
            const { practiceMode = 'conversation', topic, voiceGender = 'female', context, question } = req.body;

            // Parse context information if available
            let contextInfo = null;
            if (context) {
                try {
                    contextInfo = typeof context === 'string' ? JSON.parse(context) : context;
                } catch (error) {
                    console.error('Failed to parse context:', error);
                }
            }

            // Check if audio file was uploaded
            if (!req.file) {
                return res.status(400).json({ error: 'No audio file uploaded' });
            }

            const audioPath = req.file.path;
            const audioUrl = `/uploads/speaking/${req.file.filename}`;

            // Transcription
            console.log('Transcribing audio...');
            const transcription = await speakingPracticeService.transcribeAudio(audioPath);

            // Analysis
            console.log('Analyzing speech...');
            const analysis = await speakingPracticeService.analyzeSpoken(
                transcription.text,
                practiceMode,
                topic,
                contextInfo
            );

            // Teacher response
            console.log('Generating teacher response...');
            const teacherResponse = analysis.teacher_response || 
                await speakingPracticeService.generateTeacherResponse(
                    transcription.text,
                    [],
                    practiceMode,
                    contextInfo
                );

            // Database persistence
            const session = await SpeakingPracticeSession.create({
                userId,
                audioUrl,
                transcription: transcription.text,
                originalText: transcription.text,
                correctedText: analysis.corrected_text,
                pronunciationScore: analysis.scores.pronunciation,
                grammarScore: analysis.scores.grammar,
                fluencyScore: analysis.scores.fluency,
                vocabularyScore: analysis.scores.vocabulary,
                overallScore: analysis.scores.overall,
                pronunciationErrors: analysis.pronunciation_errors || [],
                grammarErrors: analysis.grammar_errors || [],
                suggestions: analysis.feedback,
                aiResponseText: teacherResponse,
                voiceGender,
                practiceMode,
                topic: topic || question || 'General practice',
                durationSeconds: Math.round(transcription.duration || 0)
            });

            // Text-to-speech
            const ttsInfo = await speakingPracticeService.textToSpeech(
                teacherResponse,
                voiceGender
            );

            res.json({
                success: true,
                sessionId: session.id,
                transcription: transcription.text,
                analysis: {
                    correctedText: analysis.corrected_text,
                    scores: analysis.scores,
                    pronunciationErrors: analysis.pronunciation_errors || [],
                    grammarErrors: analysis.grammar_errors || [],
                    feedback: analysis.feedback,
                    vocabulary_analysis: analysis.vocabulary_analysis,
                    skill_weaknesses: analysis.skill_weaknesses,
                    off_topic: analysis.off_topic,
                    topic_relevance_explanation: analysis.topic_relevance_explanation,
                    scoring_justification: analysis.scoring_justification
                },
                teacherResponse: {
                    text: teacherResponse,
                    tts: ttsInfo
                }
            });

        } catch (error) {
            console.error('Submit speech error:', error);
            res.status(500).json({
                error: 'Failed to process speech',
                details: error.message
            });
        }
    }

    /**
     * Save recording without analysis (for history only)
     */
    async saveRecording(req, res) {
        try {
            const userId = req.user.id;
            const { practiceMode = 'conversation', topic, question } = req.body;

            // Check if audio file was uploaded
            if (!req.file) {
                return res.status(400).json({ error: 'No audio file uploaded' });
            }

            const audioPath = req.file.path;
            const audioUrl = `/uploads/speaking/${req.file.filename}`;

            // Transcription only (no analysis)
            console.log('Transcribing audio...');
            const transcription = await speakingPracticeService.transcribeAudio(audioPath);

            // Database persistence - save without scores
            const session = await SpeakingPracticeSession.create({
                userId,
                audioUrl,
                transcription: transcription.text,
                originalText: transcription.text,
                correctedText: null,
                pronunciationScore: null,
                grammarScore: null,
                fluencyScore: null,
                vocabularyScore: null,
                overallScore: null,
                pronunciationErrors: [],
                grammarErrors: [],
                suggestions: null,
                aiResponseText: 'Recording saved for future review',
                voiceGender: 'female',
                practiceMode,
                topic: topic || question || 'Saved practice',
                durationSeconds: Math.round(transcription.duration || 0)
            });

            res.json({
                success: true,
                sessionId: session.id,
                message: 'Recording saved successfully',
                transcription: transcription.text
            });

        } catch (error) {
            console.error('Save recording error:', error);
            res.status(500).json({
                error: 'Failed to save recording',
                details: error.message
            });
        }
    }

    /**
     * Get user's practice history
     */
    async getPracticeHistory(req, res) {
        try {
            const userId = req.user.id;
            const { limit = 20, offset = 0, practiceMode } = req.query;

            const where = { userId };
            if (practiceMode) {
                where.practiceMode = practiceMode;
            }

            const sessions = await SpeakingPracticeSession.findAll({
                where,
                attributes: [
                    'id', 'practiceMode', 'topic', 
                    'pronunciationScore', 'grammarScore', 'fluencyScore',
                    'vocabularyScore', 'overallScore',
                    'durationSeconds', 'createdAt',
                    'audioUrl', 'transcription'  // Added audioUrl and transcription
                ],
                order: [['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            // Transform to match frontend naming convention (snake_case)
            const transformedSessions = sessions.map(session => ({
                id: session.id,
                practice_mode: session.practiceMode,
                topic: session.topic,
                pronunciation_score: session.pronunciationScore,
                grammar_score: session.grammarScore,
                fluency_score: session.fluencyScore,
                vocabulary_score: session.vocabularyScore,
                overall_score: session.overallScore,
                duration_seconds: session.durationSeconds,
                created_at: session.createdAt,
                audio_url: session.audioUrl,  // Convert to snake_case
                transcription: session.transcription
            }));

            // Get statistics using raw query (for aggregation)
            const stats = await SpeakingPracticeSession.findOne({
                where: { userId },
                attributes: [
                    [SpeakingPracticeSession.sequelize.fn('COUNT', '*'), 'totalSessions'],
                    [SpeakingPracticeSession.sequelize.fn('AVG', SpeakingPracticeSession.sequelize.col('overallScore')), 'avgScore'],
                    [SpeakingPracticeSession.sequelize.fn('AVG', SpeakingPracticeSession.sequelize.col('pronunciationScore')), 'avgPronunciation'],
                    [SpeakingPracticeSession.sequelize.fn('AVG', SpeakingPracticeSession.sequelize.col('grammarScore')), 'avgGrammar'],
                    [SpeakingPracticeSession.sequelize.fn('AVG', SpeakingPracticeSession.sequelize.col('fluencyScore')), 'avgFluency'],
                    [SpeakingPracticeSession.sequelize.fn('AVG', SpeakingPracticeSession.sequelize.col('vocabularyScore')), 'avgVocabulary'],
                    [SpeakingPracticeSession.sequelize.fn('SUM', SpeakingPracticeSession.sequelize.col('durationSeconds')), 'totalTimeSeconds']
                ],
                raw: true
            });

            res.json({
                success: true,
                sessions: transformedSessions,  // Use transformed data
                statistics: stats || {}
            });

        } catch (error) {
            console.error('Get history error:', error);
            res.status(500).json({ error: 'Failed to get practice history' });
        }
    }

    /**
     * Get detailed session by ID
     */
    async getSessionDetail(req, res) {
        try {
            const userId = req.user.id;
            const sessionId = req.params.id;

            const session = await SpeakingPracticeSession.findOne({
                where: { 
                    id: sessionId,
                    userId 
                }
            });

            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }

            res.json({
                success: true,
                session
            });

        } catch (error) {
            console.error('Get session detail error:', error);
            res.status(500).json({ error: 'Failed to get session details' });
        }
    }

    /**
     * Get available practice topics
     */
    async getTopics(req, res) {
        try {
            const { difficulty, category } = req.query;

            // Use raw query for topics table (not yet migrated to Sequelize)
            let query = 'SELECT * FROM speaking_practice_topics WHERE is_active = TRUE';
            const params = [];

            if (difficulty) {
                query += ' AND difficulty_level = ?';
                params.push(difficulty);
            }

            if (category) {
                query += ' AND category = ?';
                params.push(category);
            }

            query += ' ORDER BY difficulty_level, title';

            const [topics] = await sequelize.query(query, { 
                replacements: params
            });

            const parsedTopics = (Array.isArray(topics) ? topics : []).map(topic => {
                try {
                    if (typeof topic.sample_questions === 'string') {
                        topic.sample_questions = JSON.parse(topic.sample_questions);
                    }
                } catch (e) {
                    console.error('Failed to parse sample_questions for topic:', topic.id, e);
                    topic.sample_questions = [];
                }
                return topic;
            });

            res.json({
                success: true,
                topics: parsedTopics
            });

        } catch (error) {
            console.error('Get topics error:', error);
            res.status(500).json({ 
                error: 'Failed to get topics',
                details: error.message 
            });
        }
    }

    /**
     * Get random topic for practice
     */
    async getRandomTopic(req, res) {
        try {
            const { difficulty = 'intermediate' } = req.query;
            const topic = await speakingPracticeService.getRandomTopic(difficulty);

            if (!topic) {
                return res.status(404).json({ error: 'No topics found' });
            }

            topic.sample_questions = JSON.parse(topic.sample_questions || '[]');

            // Generate sample answer for the first question
            if (topic.sample_questions && topic.sample_questions.length > 0) {
                const sampleAnswer = await speakingPracticeService.generateSampleAnswer(
                    topic.title,
                    topic.sample_questions[0]
                );
                topic.sample_answer = sampleAnswer;
            }

            res.json({
                success: true,
                topic
            });

        } catch (error) {
            console.error('Get random topic error:', error);
            res.status(500).json({ error: 'Failed to get random topic' });
        }
    }

    /**
     * Quick conversation mode (no full analysis, just chat)
     */
    async quickConversation(req, res) {
        try {
            const { text, conversationHistory = [], voiceGender = 'female' } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'No text provided' });
            }

            // Generate response
            const response = await speakingPracticeService.generateTeacherResponse(
                text,
                conversationHistory,
                'conversation'
            );

            // Get TTS info
            const ttsInfo = await speakingPracticeService.textToSpeech(
                response,
                voiceGender
            );

            res.json({
                success: true,
                response: {
                    text: response,
                    tts: ttsInfo
                }
            });

        } catch (error) {
            console.error('Quick conversation error:', error);
            res.status(500).json({ error: 'Failed to generate response' });
        }
    }

    /**
     * Delete practice session
     */
    async deleteSession(req, res) {
        try {
            const userId = req.user.id;
            const sessionId = req.params.id;

            // Getssions.length === 0) {
                resession = await SpeakingPracticeSession.findOne({
                where: { 
                    id: sessionId,
                    userId 
                },
                attributes: ['audioUrl']
            });

            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }

            // Delete audio file
            if (session.audioUrl) {
                const audioPath = path.join(__dirname, '../../', session.audioUrl);
                try {
                    await fs.unlink(audioPath);
                } catch (err) {
                    console.error('Failed to delete audio file:', err);
                }
            }

            // Delete from database
            await session.destroy();

            res.json({
                success: true,
                message: 'Session deleted successfully'
            });

        } catch (error) {
            console.error('Delete session error:', error);
            res.status(500).json({ error: 'Failed to delete session' });
        }
    }

    /**
     * AI Voice Assistant chat endpoint (no auth required)
     */
    async aiChat(req, res) {
        try {
            const { message } = req.body;

            if (!message || !message.trim()) {
                return res.status(400).json({ error: 'Message is required' });
            }

            console.log('AI Chat request, Message:', message);

            // Generate AI response using the teacher response method
            const aiResponse = await speakingPracticeService.generateTeacherResponse(
                message,
                [], // Empty conversation history
                'conversation',
                null  // No context
            );

            res.json({
                success: true,
                response: aiResponse
            });

        } catch (error) {
            console.error('AI chat error:', error);
            res.status(500).json({ 
                error: 'Failed to generate AI response',
                message: error.message
            });
        }
    }

    /**
     * Generate sample answer for specific question
     */
    async generateSampleForQuestion(req, res) {
        try {
            const { topic, question, difficulty = 'intermediate' } = req.body;

            if (!topic || !question) {
                return res.status(400).json({ error: 'Topic and question are required' });
            }

            console.log('Generating sample answer for:', { topic, question, difficulty });

            // Generate sample answer using the service (now returns {sample_answer, vocabulary})
            const result = await speakingPracticeService.generateSampleAnswer(
                topic,
                question,
                difficulty
            );

            if (result && result.sample_answer) {
                res.json({
                    success: true,
                    sample_answer: result.sample_answer,
                    vocabulary: result.vocabulary || []
                });
            } else {
                res.status(500).json({ 
                    error: 'Failed to generate sample answer'
                });
            }

        } catch (error) {
            console.error('Generate sample error:', error);
            res.status(500).json({ 
                error: 'Failed to generate sample answer',
                message: error.message
            });
        }
    }
}

export default new SpeakingPracticeController();
