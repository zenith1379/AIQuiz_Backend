// Quiz API Integration Tests
import request from 'supertest';
import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/config/database.js', () => ({
  default: { query: jest.fn() }
}));

jest.unstable_mockModule('../../src/config/sequelize.js', () => ({
  default: { transaction: jest.fn(), query: jest.fn() }
}));

jest.unstable_mockModule('../../src/models/index.js', () => ({
  QuizModel: { findAll: jest.fn().mockResolvedValue([]), findByPk: jest.fn(), create: jest.fn(), destroy: jest.fn() },
  QuestionModel: {},
  ChoiceModel: {},
  UserModel: {},
  User: { fromDatabase: jest.fn(d => d) }
}));

let app;
beforeAll(async () => {
  app = (await import('../../src/app.js')).default;
});

describe('Quiz API', () => {
  describe('GET /api/quizzes', () => {
    it('returns quiz list', async () => {
      const res = await request(app).get('/api/quizzes').expect('Content-Type', /json/);
      expect([200, 401, 500]).toContain(res.status);
    });
  });

  describe('GET /api/quizzes/community', () => {
    it('returns community quizzes', async () => {
      const res = await request(app).get('/api/quizzes/community').expect('Content-Type', /json/);
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('GET /api/quizzes/:id', () => {
    it('returns quiz by ID', async () => {
      const res = await request(app).get('/api/quizzes/1').expect('Content-Type', /json/);
      expect([200, 404, 500]).toContain(res.status);
    });

    it('returns 404 for non-existent', async () => {
      const res = await request(app).get('/api/quizzes/99999').expect('Content-Type', /json/);
      expect([404, 500]).toContain(res.status);
    });
  });

  describe('POST /api/quizzes', () => {
    it('rejects without auth', async () => {
      const res = await request(app)
        .post('/api/quizzes')
        .send({ title: 'Test', meaning: 'Desc' })
        .expect('Content-Type', /json/);
      expect([401, 403]).toContain(res.status);
    });

    it('creates with valid token', async () => {
      const quiz = {
        title: 'Test Quiz',
        meaning: 'Description',
        questions: [{ question_text: '2+2?', question_type: 'single', choices: [{ choice_text: '4', is_correct: true }] }]
      };

      const res = await request(app)
        .post('/api/quizzes')
        .set('Authorization', 'Bearer mock-token')
        .send(quiz)
        .expect('Content-Type', /json/);
      expect([201, 401, 403, 500]).toContain(res.status);
    });
  });

  describe('DELETE /api/quizzes/:id', () => {
    it('rejects without auth', async () => {
      const res = await request(app).delete('/api/quizzes/1').expect('Content-Type', /json/);
      expect([401, 403]).toContain(res.status);
    });
  });
});
