import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const QuizSession = sequelize.define('QuizSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quizId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'quiz_id',
    references: {
      model: 'quizzes',
      key: 'id'
    }
  },
  hostId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'host_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  sessionCode: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    field: 'session_code'
  },
  status: {
    type: DataTypes.ENUM('waiting', 'active', 'completed', 'cancelled'),
    defaultValue: 'waiting'
  },
  currentQuestionIndex: {
    type: DataTypes.INTEGER,
    field: 'current_question_index',
    defaultValue: 0
  },
  startedAt: {
    type: DataTypes.DATE,
    field: 'started_at'
  },
  endedAt: {
    type: DataTypes.DATE,
    field: 'ended_at'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'quiz_sessions',
  timestamps: false,
  indexes: [
    { fields: ['session_code'] },
    { fields: ['status'] }
  ]
});

export default QuizSession;
