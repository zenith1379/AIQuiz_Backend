import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const QuestionModel = sequelize.define('Question', {
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
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'question_text'
  },
  questionType: {
    type: DataTypes.ENUM('single', 'multiple', 'matching', 'fill_blank', 'true_false'),
    field: 'question_type',
    defaultValue: 'single'
  },
  timeLimit: {
    type: DataTypes.INTEGER,
    field: 'time_limit',
    defaultValue: 30,
    comment: 'Time limit in seconds'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'questions',
  timestamps: false,
  indexes: [
    { fields: ['quiz_id'] }
  ]
});

export default QuestionModel;
