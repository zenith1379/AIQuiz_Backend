import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { createLogger } from '../utils/logger.js';

dotenv.config();

const log = createLogger('sequelize');

// Production requires DB_PASSWORD to be set in environment
if (process.env.NODE_ENV === 'production' && !process.env.DB_PASSWORD) {
  throw new Error('DB_PASSWORD must be set in production environment!');
}

const sequelizeConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? (msg) => log.info(msg) : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  dialectOptions: {
    connectTimeout: 60000,
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  }
};

// Add SSL for production (Aiven requires SSL)
if (process.env.NODE_ENV === 'production') {
  sequelizeConfig.dialectOptions.ssl = {
    rejectUnauthorized: false
  };
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'quiz_generator',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || (process.env.NODE_ENV === 'production' ? undefined : 'root'),
  sequelizeConfig
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    log.error('Unable to connect to database via Sequelize:', error.message);
  }
};

testConnection();

export default sequelize;
