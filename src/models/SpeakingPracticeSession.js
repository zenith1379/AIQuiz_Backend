import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const SpeakingPracticeSession = sequelize.define('SpeakingPracticeSession', {
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
  audioUrl: {
    type: DataTypes.STRING(500),
    field: 'audio_url'
  },
  transcription: {
    type: DataTypes.TEXT
  },
  originalText: {
    type: DataTypes.TEXT,
    field: 'original_text'
  },
  correctedText: {
    type: DataTypes.TEXT,
    field: 'corrected_text'
  },
  pronunciationScore: {
    type: DataTypes.INTEGER,
    field: 'pronunciation_score',
    validate: { min: 0, max: 100 }
  },
  grammarScore: {
    type: DataTypes.INTEGER,
    field: 'grammar_score',
    validate: { min: 0, max: 100 }
  },
  fluencyScore: {
    type: DataTypes.INTEGER,
    field: 'fluency_score',
    validate: { min: 0, max: 100 }
  },
  vocabularyScore: {
    type: DataTypes.INTEGER,
    field: 'vocabulary_score',
    validate: { min: 0, max: 100 }
  },
  overallScore: {
    type: DataTypes.INTEGER,
    field: 'overall_score',
    validate: { min: 0, max: 100 }
  },
  pronunciationErrors: {
    type: DataTypes.JSON,
    field: 'pronunciation_errors',
    defaultValue: []
  },
  grammarErrors: {
    type: DataTypes.JSON,
    field: 'grammar_errors',
    defaultValue: []
  },
  suggestions: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  aiResponseText: {
    type: DataTypes.TEXT,
    field: 'ai_response_text'
  },
  aiAudioUrl: {
    type: DataTypes.STRING(500),
    field: 'ai_audio_url'
  },
  voiceGender: {
    type: DataTypes.ENUM('male', 'female'),
    field: 'voice_gender',
    defaultValue: 'female'
  },
  practiceMode: {
    type: DataTypes.ENUM('conversation', 'pronunciation', 'fluency', 'vocabulary'),
    field: 'practice_mode',
    defaultValue: 'conversation'
  },
  topic: {
    type: DataTypes.STRING(100)
  },
  durationSeconds: {
    type: DataTypes.INTEGER,
    field: 'duration_seconds'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'speaking_practice_sessions',
  timestamps: false
});

export default SpeakingPracticeSession;
