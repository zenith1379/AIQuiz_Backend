import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const SessionAnswer = sequelize.define('SessionAnswer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'session_id',
    references: {
      model: 'quiz_sessions',
      key: 'id'
    }
  },
  participantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'participant_id',
    references: {
      model: 'session_participants',
      key: 'id'
    }
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'question_id',
    references: {
      model: 'questions',
      key: 'id'
    }
  },
  choiceId: {
    type: DataTypes.INTEGER,
    field: 'choice_id',
    references: {
      model: 'choices',
      key: 'id'
    }
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    field: 'is_correct'
  },
  pointsEarned: {
    type: DataTypes.INTEGER,
    field: 'points_earned',
    defaultValue: 0
  },
  responseTime: {
    type: DataTypes.INTEGER,
    field: 'response_time',
    comment: 'Response time in milliseconds'
  },
  answeredAt: {
    type: DataTypes.DATE,
    field: 'answered_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'session_answers',
  timestamps: false,
  indexes: [
    { fields: ['session_id', 'participant_id'] },
    { fields: ['question_id'] }
  ]
});

export default SessionAnswer;
