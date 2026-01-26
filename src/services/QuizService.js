import { QuizModel, QuestionModel, ChoiceModel, UserModel } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/sequelize.js';

export class QuizService {
  // Get all quizzes with user info
  static async getAll(filters = {}) {
    const where = {};
    
    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${filters.search}%` } },
        { meaning: { [Op.like]: `%${filters.search}%` } }
      ];
    }

    const quizzes = await QuizModel.findAll({
      where,
      include: [{
        model: UserModel,
        as: 'creator',
        attributes: ['id', 'username', 'role']
      }],
      order: [['createdAt', 'DESC']],
      raw: false
    });

    return quizzes.map(q => ({
      quiz_id: q.id,
      user_id: q.userId,
      title: q.title,
      description: q.meaning,      image: q.image,      created_at: q.createdAt,
      username: q.creator?.username,
      role: q.creator?.role
    }));
  }

  // Get community quizzes (only from teachers)
  static async getCommunity(limit = 50) {
    const quizzes = await QuizModel.findAll({
      include: [{
        model: UserModel,
        as: 'creator',
        where: { role: 'teacher' },
        attributes: ['id', 'username', 'role']
      }],
      order: [['createdAt', 'DESC']],
      limit,
      raw: false
    });

    return quizzes.map(q => ({
      quiz_id: q.id,
      user_id: q.userId,
      title: q.title,
      description: q.meaning,
      image: q.image,
      created_at: q.createdAt,
      username: q.creator?.username,
      role: q.creator?.role
    }));
  }

  // Get quiz by ID with questions and choices
  static async getById(quizId) {
    const quiz = await QuizModel.findByPk(quizId, {
      include: [{
        model: QuestionModel,
        as: 'questions',
        include: [{
          model: ChoiceModel,
          as: 'choices',
          order: [['id', 'ASC']]
        }],
        order: [['id', 'ASC']]
      }]
    });

    if (!quiz) {
      return null;
    }

    // Transform to legacy format
    const result = {
      quiz_id: quiz.id,
      user_id: quiz.userId,
      title: quiz.title,
      description: quiz.meaning,
      image: quiz.image,
      created_at: quiz.createdAt,
      questions: quiz.questions.map(q => ({
        question_id: q.id,
        quiz_id: q.quizId,
        question_text: q.questionText,
        question_type: q.questionType,
        time_limit: q.timeLimit,
        choices: q.choices.map(c => ({
          choice_id: c.id,
          question_id: c.questionId,
          choice_text: c.choiceText,
          is_correct: c.isCorrect,
          metadata: c.metadata
        })),
        // For matching questions
        matching_pairs: q.questionType === 'matching' ? q.choices.map(c => ({
          term: c.choiceText || '',
          definition: c.metadata?.definition || ''
        })) : undefined
      }))
    };

    return result;
  }

  // Create quiz
  static async create(quizData) {
    if (!quizData.user_id || !quizData.title) {
      throw new Error(`Invalid quiz data: missing ${!quizData.user_id ? 'user_id' : 'title'}`);
    }

    const quiz = await QuizModel.create({
      userId: quizData.user_id,
      title: quizData.title,
      meaning: quizData.description || ''
    });

    return {
      quiz_id: quiz.id,
      user_id: quiz.userId,
      title: quiz.title,
      description: quiz.meaning
    };
  }

  // Update quiz
  static async update(quizId, quizData) {
    const updates = {};

    if (quizData.title !== undefined) {
      updates.title = quizData.title;
    }
    if (quizData.description !== undefined) {
      updates.meaning = quizData.description;
    }
    if (quizData.image !== undefined) {
      updates.image = quizData.image;
    }

    if (Object.keys(updates).length === 0) {
      throw new Error('No fields to update');
    }

    await QuizModel.update(updates, {
      where: { id: quizId }
    });

    return await this.getById(quizId);
  }

  // Delete quiz (cascade deletes questions and choices)
  static async delete(quizId) {
    const result = await QuizModel.destroy({
      where: { id: quizId }
    });
    return result > 0;
  }

  // Get questions for a quiz
  static async getQuestions(quizId) {
    const questions = await QuestionModel.findAll({
      where: { quizId },
      include: [{
        model: ChoiceModel,
        as: 'choices',
        order: [['id', 'ASC']]
      }],
      order: [['id', 'ASC']]
    });

    return questions.map(q => ({
      question_id: q.id,
      quiz_id: q.quizId,
      question_text: q.questionText,
      question_type: q.questionType,
      time_limit: q.timeLimit,
      choices: q.choices.map(c => ({
        choice_id: c.id,
        question_id: c.questionId,
        choice_text: c.choiceText,
        is_correct: c.isCorrect,
        metadata: c.metadata
      })),
      matching_pairs: q.questionType === 'matching' ? q.choices.map(c => ({
        term: c.choiceText || '',
        definition: c.metadata?.definition || ''
      })) : undefined
    }));
  }

  // Add question to quiz
  static async addQuestion(questionData) {
    if (!questionData.quiz_id || !questionData.question_text) {
      throw new Error('Invalid question data');
    }

    const transaction = await sequelize.transaction();

    try {
      // Insert question
      const question = await QuestionModel.create({
        quizId: questionData.quiz_id,
        questionText: questionData.question_text,
        questionType: questionData.question_type || 'single',
        timeLimit: questionData.time_limit || 30
      }, { transaction });

      // Add choices if provided
      if (questionData.choices && questionData.choices.length > 0) {
        const choices = questionData.choices.map((choiceData, index) => ({
          questionId: question.id,
          choiceText: choiceData.choice_text || choiceData.text || '',
          isCorrect: Boolean(choiceData.is_correct),
          metadata: choiceData.metadata || null,
          orderIndex: index
        }));

        await ChoiceModel.bulkCreate(choices, { transaction });
      }

      await transaction.commit();

      return {
        question_id: question.id,
        quiz_id: question.quizId,
        question_text: question.questionText,
        question_type: question.questionType,
        time_limit: question.timeLimit
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Update question
  static async updateQuestion(questionId, questionData) {
    const updates = {};

    if (questionData.question_text !== undefined) {
      updates.questionText = questionData.question_text;
    }
    if (questionData.question_type !== undefined) {
      updates.questionType = questionData.question_type;
    }
    if (questionData.time_limit !== undefined) {
      updates.timeLimit = questionData.time_limit;
    }

    if (Object.keys(updates).length > 0) {
      await QuestionModel.update(updates, {
        where: { id: questionId }
      });
    }

    return true;
  }

  // Delete question
  static async deleteQuestion(questionId) {
    const result = await QuestionModel.destroy({
      where: { id: questionId }
    });
    return result > 0;
  }

  // Get choices for a question
  static async getChoices(questionId) {
    const choices = await ChoiceModel.findAll({
      where: { questionId },
      order: [['id', 'ASC']]
    });

    return choices.map(c => ({
      choice_id: c.id,
      choice_text: c.choiceText,
      is_correct: c.isCorrect,
      metadata: c.metadata
    }));
  }

  // Get quizzes by approval status
  static async getQuizzesByApprovalStatus(status = 'pending') {
    try {
      const quizzes = await QuizModel.findAll({
        where: { approvalStatus: status },
        include: [{
          model: UserModel,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }],
        order: [['createdAt', 'DESC']]
      });
      
      return quizzes.map(q => ({
        quiz_id: q.id,
        user_id: q.userId,
        title: q.title,
        description: q.meaning,
        approval_status: q.approvalStatus,
        created_at: q.createdAt,
        username: q.creator?.username,
        email: q.creator?.email
      }));
    } catch (error) {
      console.error('Error getting quizzes by approval status:', error);
      return [];
    }
  }

  // Get all quizzes with questions for admin statistics
  static async getAllQuizzesWithQuestions() {
    const quizzes = await QuizModel.findAll({
      include: [{
        model: QuestionModel,
        as: 'questions',
        attributes: ['id', 'quizId', 'questionText', 'questionType']
      }],
      order: [['createdAt', 'DESC']]
    });

    return quizzes.map(q => ({
      quiz_id: q.id,
      user_id: q.userId,
      title: q.title,
      description: q.meaning,
      created_at: q.createdAt,
      questions: q.questions.map(quest => ({
        question_id: quest.id,
        quiz_id: quest.quizId,
        question_text: quest.questionText,
        question_type: quest.questionType
      }))
    }));
  }

  // Approve quiz
  static async approveQuiz(quizId, adminId) {
    const [affectedCount] = await QuizModel.update(
      { 
        approvalStatus: 'approved',
        approvedBy: adminId,
        approvedAt: new Date()
      },
      { where: { id: quizId } }
    );

    if (affectedCount === 0) {
      throw new Error('Quiz not found');
    }

    return { quizId, status: 'approved' };
  }

  // Reject quiz
  static async rejectQuiz(quizId, adminId, reason = null) {
    const [affectedCount] = await QuizModel.update(
      { 
        approvalStatus: 'rejected',
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectionReason: reason
      },
      { where: { id: quizId } }
    );

    if (affectedCount === 0) {
      throw new Error('Quiz not found');
    }

    return { quizId, status: 'rejected', reason };
  }

  // Request quiz to be published (set to pending approval)
  static async requestPublic(quizId, userId) {
    // Check if quiz belongs to user
    const quiz = await QuizModel.findByPk(quizId);
    
    if (!quiz) {
      throw new Error('Quiz not found');
    }
    
    if (quiz.userId !== userId) {
      throw new Error('You can only request publication for your own quizzes');
    }

    await quiz.update({ approvalStatus: 'pending' });

    return { quizId, status: 'pending' };
  }
}

export default QuizService;
