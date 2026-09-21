import dotenv from 'dotenv';
dotenv.config();

/**
 * Validates and exposes environment variables with strict security checks.
 */
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// Centralized JWT Secret retrieval
export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (isProduction) {
      throw new Error('[FATAL SECURITY ERROR] JWT_SECRET is not configured in production environment!');
    }
    // In local development/test, fallback for testing convenience
    return 'lms_dev_only_jwt_secret_must_be_changed_in_production_32chars!';
  }

  if (isProduction && secret.length < 32) {
    throw new Error('[FATAL SECURITY ERROR] JWT_SECRET must be at least 32 characters long in production!');
  }

  return secret;
};

// Centralized MongoDB URI retrieval
export const getMongoUri = () => {
  const uri = process.env.MONGO_URI;
  if (!uri && isProduction) {
    throw new Error('[FATAL SECURITY ERROR] MONGO_URI must be specified in production environment!');
  }
  return uri || 'mongodb://localhost:27017/lms_portal';
};

export const config = {
  NODE_ENV,
  isProduction,
  PORT: Number(process.env.PORT) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  ADMIN_REGISTRATION_KEY: process.env.ADMIN_REGISTRATION_KEY || '',
};

export default config;
