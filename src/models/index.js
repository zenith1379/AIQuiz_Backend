// Legacy Plain Object Models (backwards compatibility)
import User from './User.js';
import Quiz from './Quiz.js';
import Question from './Question.js';
import Choice from './Choice.js';
import PasswordResetToken from './PasswordResetToken.js';
import AuditLog from './AuditLog.js';
import TodoItem from './TodoItem.js';
import CalendarEvent from './CalendarEvent.js';

// Sequelize Models
import UserModel from './UserModel.js';
import QuizModel from './QuizModel.js';
import QuestionModel from './QuestionModel.js';
import ChoiceModel from './ChoiceModel.js';
import SpeakingPracticeSession from './SpeakingPracticeSession.js';
import QuizSession from './QuizSession.js';
import SessionParticipant from './SessionParticipant.js';
import SessionAnswer from './SessionAnswer.js';
import AIFeedback from './AIFeedback.js';
import AITrainingBatch from './AITrainingBatch.js';

// Setup Sequelize Associations
const setupAssociations = () => {
  // User relationships
  UserModel.hasMany(QuizModel, { 
    foreignKey: 'userId', 
    as: 'quizzes',
    onDelete: 'CASCADE'
  });
  QuizModel.belongsTo(UserModel, { 
    foreignKey: 'userId',
    as: 'creator'
  });

  UserModel.hasMany(SpeakingPracticeSession, {
    foreignKey: 'userId',
    as: 'speakingSessions',
    onDelete: 'CASCADE'
  });

  // Quiz relationships
  QuizModel.hasMany(QuestionModel, { 
    foreignKey: 'quizId', 
    as: 'questions',
    onDelete: 'CASCADE'
  });
  QuestionModel.belongsTo(QuizModel, { 
    foreignKey: 'quizId',
    as: 'quiz'
  });

  // Question relationships
  QuestionModel.hasMany(ChoiceModel, { 
    foreignKey: 'questionId', 
    as: 'choices',
    onDelete: 'CASCADE'
  });
  ChoiceModel.belongsTo(QuestionModel, { 
    foreignKey: 'questionId',
    as: 'question'
  });

  // Quiz Session relationships
  QuizSession.hasMany(SessionParticipant, { 
    foreignKey: 'sessionId', 
    as: 'participants',
    onDelete: 'CASCADE'
  });
  SessionParticipant.belongsTo(QuizSession, { 
    foreignKey: 'sessionId',
    as: 'session'
  });

  QuizSession.hasMany(SessionAnswer, { 
    foreignKey: 'sessionId', 
    as: 'answers',
    onDelete: 'CASCADE'
  });
  SessionAnswer.belongsTo(QuizSession, { 
    foreignKey: 'sessionId',
    as: 'session'
  });

  SessionParticipant.hasMany(SessionAnswer, { 
    foreignKey: 'participantId', 
    as: 'answers',
    onDelete: 'CASCADE'
  });
  SessionAnswer.belongsTo(SessionParticipant, { 
    foreignKey: 'participantId',
    as: 'participant'
  });
};

// Initialize associations
setupAssociations();

// Export legacy models (backwards compatibility)
export { 
  User, Quiz, Question, Choice, 
  PasswordResetToken, AuditLog, TodoItem, CalendarEvent
};

// Export Sequelize models
export { 
  UserModel,
  QuizModel,
  QuestionModel,
  ChoiceModel,
  SpeakingPracticeSession,
  QuizSession,
  SessionParticipant,
  SessionAnswer,
  AIFeedback,
  AITrainingBatch
};
