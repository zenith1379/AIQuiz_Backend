import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const ChoiceModel = sequelize.define('Choice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  choiceText: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'choice_text'
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    field: 'is_correct',
    defaultValue: false
  },
  metadata: {
    type: DataTypes.JSON,
    comment: 'Additional data for matching questions, etc.'
  }
}, {
  tableName: 'choices',
  timestamps: false,
  indexes: [
    { fields: ['question_id'] }
  ]
});

export default ChoiceModel;
