'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    user_id: DataTypes.INTEGER,
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.ENUM,
    dob: DataTypes.DATE,
    avatar: DataTypes.STRING,
    is_premium: DataTypes.BOOLEAN,
    subscription_tier: DataTypes.STRING,
    subscription_expires_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};