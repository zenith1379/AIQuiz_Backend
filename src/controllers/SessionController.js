import { QuizSession, SessionParticipant, SessionAnswer } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/sequelize.js';

export class SessionController {
  static async createSession(req, res, next) {
    try {
      const { quiz_id, host_id, session_code } = req.body;

      if (!quiz_id || !host_id || !session_code) {
        return res.status(400).json({ 
          error: 'Quiz ID, Host ID, and Session Code are required' 
        });
      }
      
      // Quiz validation
      const [quizzes] = await sequelize.query(
        'SELECT * FROM quizzes WHERE id = ?',
        { replacements: [quiz_id], type: sequelize.QueryTypes.SELECT }
      );

      if (!quizzes) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      // Create session
      const session = await QuizSession.create({
        quizId: quiz_id,
        hostId: host_id,
        sessionCode: session_code,
        status: 'waiting'
      });

      res.status(201).json({
        message: 'Session created successfully',
        session_id: session.id,
        session_code: session.sessionCode,
        status: session.status,
        quiz_id: session.quizId
      });
    } catch (error) {
      console.error('Create session error:', error);
      next(error);
    }
  }

  static async getSession(req, res, next) {
    try {
      const { code } = req.params;

      // Still need raw query for JOIN with non-Sequelize tables
      const [sessions] = await sequelize.query(
        `SELECT s.*, q.title as quiz_title, q.meaning as description,
                u.email as host_email, u.username as host_name
         FROM quiz_sessions s
         JOIN quizzes q ON s.quiz_id = q.id
         JOIN users u ON s.host_id = u.id
         WHERE s.session_code = ?`,
        { replacements: [code], type: sequelize.QueryTypes.SELECT }
      );

      if (!sessions) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Get participant count using Sequelize
      const participantCount = await SessionParticipant.count({
        where: { 
          sessionId: sessions.id,
          isActive: true
        }
      });

      const session = {
        ...sessions,
        participant_count: participantCount
      };

      res.json(session);
    } catch (error) {
      console.error('Get session error:', error);
      next(error);
    }
  }

  static async joinSession(req, res, next) {
    try {
      const { session_code, participant_name, user_id, socket_id } = req.body;

      // Find session
      const session = await QuizSession.findOne({
        where: { 
          sessionCode: session_code,
          status: 'waiting'
        }
      });

      if (!session) {
        return res.status(404).json({ 
          error: 'Session not found or already started' 
        });
      }

      // Check participant limit (if max_participants exists)
      const participantCount = await SessionParticipant.count({
        where: { 
          sessionId: session.id,
          isActive: true
        }
      });

      // Add participant
      const participant = await SessionParticipant.create({
        sessionId: session.id,
        userId: user_id || null,
        participantName: participant_name,
        socketId: socket_id,
        isActive: true
      });

      res.status(201).json({
        message: 'Joined session successfully',
        participant_id: participant.id,
        session_id: session.id,
        quiz_id: session.quizId
      });
    } catch (error) {
      console.error('Join session error:', error);
      next(error);
    }
  }

  static async startSession(req, res, next) {
    try {
      const { session_id } = req.params;

      await QuizSession.update(
        { 
          status: 'active',
          startedAt: new Date()
        },
        { where: { id: session_id } }
      );

      res.json({ 
        message: 'Session started successfully',
        status: 'active'
      });
    } catch (error) {
      console.error('Start session error:', error);
      next(error);
    }
  }

  static async getParticipants(req, res, next) {
    try {
      const { session_id } = req.params;

      const participants = await SessionParticipant.findAll({
        where: { 
          sessionId: session_id,
          isActive: true
        },
        attributes: ['id', 'participantName', 'joinedAt', 'score', 'isActive'],
        order: [['joinedAt', 'ASC']],
        raw: true
      });

      // Map to match expected format
      const formattedParticipants = participants.map(p => ({
        participant_id: p.id,
        participant_name: p.participantName,
        joined_at: p.joinedAt,
        score: p.score,
        is_active: p.isActive
      }));

      res.json({ participants: formattedParticipants });
    } catch (error) {
      console.error('Get participants error:', error);
      next(error);
    }
  }

  static async removeParticipant(req, res, next) {
    try {
      const { participant_id } = req.params;

      await SessionParticipant.update(
        { 
          isActive: false,
          leftAt: new Date()
        },
        { where: { id: participant_id } }
      );

      res.json({ message: 'Participant removed successfully' });
    } catch (error) {
      console.error('Remove participant error:', error);
      next(error);
    }
  }
}
