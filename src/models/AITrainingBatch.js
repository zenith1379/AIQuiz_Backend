import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const AITrainingBatch = sequelize.define('AITrainingBatch', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  batchName: {
    type: DataTypes.STRING(200),
    field: 'batch_name',
    allowNull: false
  },
  feedbackType: {
    type: DataTypes.ENUM('quiz_generation', 'speaking_practice', 'general'),
    field: 'feedback_type',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  feedbackCount: {
    type: DataTypes.INTEGER,
    field: 'feedback_count',
    defaultValue: 0
  },
  processedAt: {
    type: DataTypes.DATE,
    field: 'processed_at'
  },
  result: {
    type: DataTypes.JSON
  },
  errorMessage: {
    type: DataTypes.TEXT,
    field: 'error_message'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'ai_training_batches',
  timestamps: false
});

export default AITrainingBatch;
