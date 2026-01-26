import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';
import bcrypt from 'bcrypt';

const UserModel = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  dob: {
    type: DataTypes.DATEONLY
  },
  role: {
    type: DataTypes.ENUM('student', 'teacher', 'admin', 'super_admin', 'inactive'),
    defaultValue: 'student'
  },
  avatar: {
    type: DataTypes.STRING(255)
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    field: 'is_premium',
    defaultValue: false
  },
  subscriptionTier: {
    type: DataTypes.ENUM('free', 'basic', 'pro', 'enterprise'),
    field: 'subscription_tier',
    defaultValue: 'free'
  },
  subscriptionExpiresAt: {
    type: DataTypes.DATE,
    field: 'subscription_expires_at'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: false,
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['role'] }
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password && !user.password.startsWith('$2b$')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && user.password && !user.password.startsWith('$2b$')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// Instance methods
UserModel.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserModel.prototype.isTeacher = function() {
  return this.role === 'teacher';
};

UserModel.prototype.isStudent = function() {
  return this.role === 'student';
};

UserModel.prototype.isAdmin = function() {
  return this.role === 'admin' || this.role === 'super_admin';
};

UserModel.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

export default UserModel;
