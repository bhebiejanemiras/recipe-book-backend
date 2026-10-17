import dotenv from 'dotenv';
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// In production, a missing value must stop the server instead of silently
// falling back to a placeholder secret that would compromise security.
function required(name: string, developmentFallback: string) {
  const value = process.env[name];
  if (value && value.trim() !== '') return value;
  if (isProduction) throw new Error(`Missing required environment variable: ${name}`);
  return developmentFallback;
}

export const ENV = {
  APP_NAME: process.env.APP_NAME || 'AppsDev API Tutorial',
  PORT: parseInt(process.env.PORT || '7000', 10),
  NODE_ENV,
  JWT_SECRET: required('JWT_SECRET', 'fallback_secret_change_me'),
  FRONTEND_URL: required('FRONTEND_URL', 'http://localhost:5173'),
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:7000',
  DATABASE_URL: required('DATABASE_URL', ''),
  CSRF_SECRET: required('CSRF_SECRET', ''),
};
