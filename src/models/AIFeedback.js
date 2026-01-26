import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const AIFeedback = sequelize.define('AIFeedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  feedbackType: {
    type: DataTypes.ENUM('quiz_generation', 'speaking_practice', 'general'),
    field: 'feedback_type',
    allowNull: false
  },
  userInput: {
    type: DataTypes.TEXT,
    field: 'user_input'
  },
  aiResponse: {
    type: DataTypes.TEXT,
    field: 'ai_response'
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: { min: 1, max: 5 }
  },
  comment: {
    type: DataTypes.TEXT
  },
  isUseful: {
    type: DataTypes.BOOLEAN,
    field: 'is_useful'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ai_feedback',
  timestamps: false
});

export default AIFeedback;
