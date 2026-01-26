import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const SessionParticipant = sequelize.define('SessionParticipant', {
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
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  participantName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'participant_name'
  },
  socketId: {
    type: DataTypes.STRING(50),
    field: 'socket_id'
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    field: 'is_active',
    defaultValue: true
  },
  joinedAt: {
    type: DataTypes.DATE,
    field: 'joined_at',
    defaultValue: DataTypes.NOW
  },
  leftAt: {
    type: DataTypes.DATE,
    field: 'left_at'
  }
}, {
  tableName: 'session_participants',
  timestamps: false,
  indexes: [
    { fields: ['session_id'] },
    { fields: ['socket_id'] }
  ]
});

export default SessionParticipant;
