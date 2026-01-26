import { AIService, QuizService } from '../services/index.js';
import db from '../config/database.js';

export class AIController {
  // Generate quiz with AI
  static async generateQuiz(req, res, next) {
    // Declare variables at function scope
    let count, diff, type;
    
    try {
      const { title, user_id, userId, questionCount, difficulty, questionType, grade, description, pdfFile } = req.body;

      // Support both camelCase and snake_case
      const finalUserId = user_id || userId;

      // Validate required fields
      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Title is required' });
      }
      if (!finalUserId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Validate question count
      count = questionCount || 5;
      if (count < 1 || count > 50) {
        return res.status(400).json({ error: 'Question count must be between 1 and 50' });
      }

      // Validate difficulty
      const validDifficulties = ['easy', 'medium', 'hard'];
      diff = difficulty || 'medium';
      if (!validDifficulties.includes(diff)) {
        return res.status(400).json({ error: 'Invalid difficulty. Must be: easy, medium, or hard' });
      }

      // Validate question type
      const validTypes = ['general', 'single', 'multiple', 'fillblank', 'matching'];
      type = questionType || 'general';
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid question type. Must be: general, single, multiple, fillblank, or matching' });
      }

      // Extract PDF content if available
      let pdfContext = null;
      if (pdfFile && pdfFile.extractedText) {
        pdfContext = {
          filename: pdfFile.name,
          text: pdfFile.extractedText,
          size: pdfFile.size
        };
      }

      // Generate content with AI
      const aiContent = await AIService.generateQuiz(title, count, diff, type, grade, description, pdfContext);

      // Create quiz
      const quiz = await QuizService.create({
        user_id: finalUserId,
        title,
        description: description || `AI-generated ${diff} quiz about ${title}`
      });

      // Add questions and choices
      if (aiContent.questions && aiContent.questions.length > 0) {
        for (const q of aiContent.questions) {
          // Handle matching questions differently
          let choices = [];
          let matchingPairs = null;

          if (q.type === 'matching' && q.matchingPairs) {
            // For matching questions, save matching pairs
            matchingPairs = q.matchingPairs;
            // Also create choices from matching pairs for database compatibility
            choices = q.matchingPairs.map(pair => ({
              choice_text: pair.term,
              is_correct: true,
              metadata: { definition: pair.definition }
            }));
          } else if (q.options) {
            // For single/fillblank questions, use options as choices
            choices = q.options.map(opt => ({
              choice_text: opt.text,
              is_correct: opt.isCorrect || false
            }));
          }

          await QuizService.addQuestion({
            quiz_id: quiz.quiz_id,
            question_text: q.text,
            question_type: q.type || 'single',
            time_limit: q.timeLimit || 30,
            choices: choices,
            matching_pairs: matchingPairs
          });
        }
      }

      // Get complete quiz with questions
      const completeQuiz = await QuizService.getById(quiz.quiz_id);
      
      // Add metadata (use const to ensure values are captured)
      const quizResponse = completeQuiz;
      quizResponse.difficulty = diff;
      quizResponse.question_count = count;
      quizResponse.question_type = type;

      res.status(201).json({
        message: 'Quiz generated successfully',
        quiz: quizResponse
      });
    } catch (error) {
      next(error);
    }
  }

  // Chat with AI
  static async chat(req, res, next) {
    try {
      const { message } = req.body;

      const response = await AIService.chat(message);

      res.json({ response });
    } catch (error) {
      next(error);
    }
  }

  // HITL feedback submission (used by game rating / question rating)
  static async submitFeedback(req, res, next) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const {
        quizId,
        topic,
        questionId,
        question_text,
        questionText,
        question_type,
        questionType,
        rating,
        tags,
        notes,
        createdAt,
        source
      } = req.body || {};

      if (!questionId || typeof questionId !== 'string') {
        return res.status(400).json({ error: 'questionId is required' });
      }

      const numericRating = rating === null || rating === undefined ? null : Number(rating);
      if (numericRating !== null && (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 10)) {
        return res.status(400).json({ error: 'rating must be a number between 1 and 10' });
      }

      const normalizedTags = Array.isArray(tags) ? tags.map(t => String(t)) : [];
      const tagsJson = normalizedTags.length ? JSON.stringify(normalizedTags) : null;

      const text = (question_text || questionText || null);
      const type = (question_type || questionType || null);

      const [result] = await db.query(
        `INSERT INTO ai_feedback (
          user_id, quiz_id, topic, question_id, question_text, question_type,
          rating, tags, notes, source, original_created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
        [
          userId,
          quizId || null,
          topic || null,
          questionId,
          text,
          type,
          numericRating,
          tagsJson,
          notes || null,
          source || null,
          createdAt ? new Date(createdAt) : null
        ]
      );

      res.status(201).json({ ok: true, feedback_id: result.insertId });
    } catch (error) {
      // Table might not exist yet in some environments
      if (error?.code === 'ER_NO_SUCH_TABLE') {
        return res.status(501).json({ error: 'Feedback storage not initialized (missing ai_feedback table)' });
      }
      next(error);
    }
  }
}

export default AIController;
