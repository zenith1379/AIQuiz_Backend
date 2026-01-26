import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const QuizModel = sequelize.define('Quiz', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  meaning: {
    type: DataTypes.TEXT,
    comment: 'Description of the quiz'
  },
  image: {
    type: DataTypes.TEXT
  },
  approvalStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    field: 'approval_status',
    defaultValue: 'approved'
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    field: 'approved_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approvedAt: {
    type: DataTypes.DATE,
    field: 'approved_at'
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    field: 'rejection_reason'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'quizzes',
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['approval_status'] },
    { fields: ['created_at'] }
  ]
});

export default QuizModel;
