// QuizService Unit Tests
import { jest } from '@jest/globals';

const mockQuizFindAll = jest.fn();
const mockQuizFindByPk = jest.fn();

jest.unstable_mockModule('../../src/models/index.js', () => ({
  QuizModel: { findAll: mockQuizFindAll, findByPk: mockQuizFindByPk, create: jest.fn(), destroy: jest.fn() },
  QuestionModel: {},
  ChoiceModel: {},
  UserModel: {}
}));

jest.unstable_mockModule('../../src/config/sequelize.js', () => ({
  default: { transaction: jest.fn() }
}));

describe('QuizService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getAll', () => {
    it('returns formatted quizzes', async () => {
      mockQuizFindAll.mockResolvedValue([
        { id: 1, userId: 1, title: 'Math Quiz', meaning: 'Basic math', createdAt: new Date(), creator: { username: 'teacher1', role: 'teacher' } },
        { id: 2, userId: 2, title: 'Science Quiz', meaning: 'Physics', createdAt: new Date(), creator: { username: 'teacher2', role: 'teacher' } }
      ]);

      const { QuizService } = await import('../../src/services/QuizService.js');
      const result = await QuizService.getAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('quiz_id', 1);
      expect(result[0]).toHaveProperty('username', 'teacher1');
    });

    it('filters by userId', async () => {
      mockQuizFindAll.mockResolvedValue([]);

      const { QuizService } = await import('../../src/services/QuizService.js');
      await QuizService.getAll({ userId: 1 });

      expect(mockQuizFindAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ userId: 1 }) })
      );
    });

    it('handles empty list', async () => {
      mockQuizFindAll.mockResolvedValue([]);

      const { QuizService } = await import('../../src/services/QuizService.js');
      expect(await QuizService.getAll()).toEqual([]);
    });
  });

  describe('getById', () => {
    it('returns quiz with questions and choices', async () => {
      mockQuizFindByPk.mockResolvedValue({
        id: 1, userId: 1, title: 'Test Quiz', meaning: 'Description', createdAt: new Date(),
        questions: [{
          id: 1, quizId: 1, questionText: 'What is 2+2?', questionType: 'single', timeLimit: 30,
          choices: [{ id: 1, choiceText: '3', isCorrect: false }, { id: 2, choiceText: '4', isCorrect: true }]
        }]
      });

      const { QuizService } = await import('../../src/services/QuizService.js');
      const result = await QuizService.getById(1);

      expect(result).toHaveProperty('quiz_id', 1);
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].choices).toHaveLength(2);
    });

    it('returns null for non-existent', async () => {
      mockQuizFindByPk.mockResolvedValue(null);

      const { QuizService } = await import('../../src/services/QuizService.js');
      expect(await QuizService.getById(999)).toBeNull();
    });
  });

  describe('getCommunity', () => {
    it('returns only teacher quizzes', async () => {
      mockQuizFindAll.mockResolvedValue([
        { id: 1, userId: 1, title: 'Teacher Quiz', meaning: 'Shared', createdAt: new Date(), creator: { username: 'teacher1', role: 'teacher' } }
      ]);

      const { QuizService } = await import('../../src/services/QuizService.js');
      const result = await QuizService.getCommunity();

      expect(mockQuizFindAll).toHaveBeenCalledWith(
        expect.objectContaining({ include: expect.arrayContaining([expect.objectContaining({ where: { role: 'teacher' } })]) })
      );
      expect(result[0].role).toBe('teacher');
    });

    it('limits to 50 by default', async () => {
      mockQuizFindAll.mockResolvedValue([]);

      const { QuizService } = await import('../../src/services/QuizService.js');
      await QuizService.getCommunity();

      expect(mockQuizFindAll).toHaveBeenCalledWith(expect.objectContaining({ limit: 50 }));
    });
  });
});
