import { QuizService } from '../services/index.js';

export class QuizController {
  // Get all quizzes
  static async getAll(req, res, next) {
    try {
      const { userId, search } = req.query;
      const filters = {};

      if (userId) filters.userId = userId;
      if (search) filters.search = search;

      const quizzes = await QuizService.getAll(filters);
      res.json(quizzes);
    } catch (error) {
      next(error);
    }
  }

  // Get community quizzes
  static async getCommunity(req, res, next) {
    try {
      const quizzes = await QuizService.getCommunity();
      res.json(quizzes);
    } catch (error) {
      next(error);
    }
  }

  // Get quiz by ID
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const quiz = await QuizService.getById(id);

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      res.json(quiz);
    } catch (error) {
      next(error);
    }
  }

  // Create quiz
  static async create(req, res, next) {
    try {
      const { user_id, title, description, image } = req.body;

      const quiz = await QuizService.create({
        user_id,
        title,
        description,
        image
      });

      res.status(201).json({
        message: 'Quiz created successfully',
        quiz_id: quiz.quiz_id
      });
    } catch (error) {
      next(error);
    }
  }

  // Update quiz
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const quizData = req.body;

      const quiz = await QuizService.update(id, quizData);

      res.json({
        message: 'Quiz updated successfully',
        quiz
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete quiz
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await QuizService.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Get questions for a quiz
  static async getQuestions(req, res, next) {
    try {
      const { id } = req.params;
      const questions = await QuizService.getQuestions(id);
      res.json(questions);
    } catch (error) {
      next(error);
    }
  }

  // Add question
  static async addQuestion(req, res, next) {
    try {
      const { quiz_id, question_text, question_type, time_limit, choices } = req.body;

      const question = await QuizService.addQuestion({
        quiz_id,
        question_text,
        question_type,
        time_limit,
        choices
      });

      res.status(201).json({
        message: 'Question added successfully',
        question_id: question.question_id
      });
    } catch (error) {
      next(error);
    }
  }

  // Update question
  static async updateQuestion(req, res, next) {
    try {
      const { id } = req.params;
      const questionData = req.body;

      await QuizService.updateQuestion(id, questionData);

      res.json({ message: 'Question updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Delete question
  static async deleteQuestion(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await QuizService.deleteQuestion(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Question not found' });
      }

      res.json({ message: 'Question deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Get choices for a question
  static async getChoices(req, res, next) {
    try {
      const { id } = req.params;
      const choices = await QuizService.getChoices(id);
      res.json(choices);
    } catch (error) {
      next(error);
    }
  }

  // Request quiz to be published to community
  static async requestPublic(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      await QuizService.requestPublic(id, userId);
      res.json({ 
        success: true, 
        message: 'Quiz submitted for approval. Administrators will review it shortly.' 
      });
    } catch (error) {
      next(error);
    }
  }
}

export default QuizController;
