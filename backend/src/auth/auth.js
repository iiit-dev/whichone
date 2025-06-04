import passport from 'passport';
import jwt from 'jsonwebtoken';
import { authenticate } from './middleware.js';
import authConfig from '../config/auth.config.js';

/**
 * Middleware to verify JWT token
 * Uses passport authentication under the hood
 */
export const verifyToken = authenticate;

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object to create token for
 * @returns {string} JWT token
 */
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name
  };
  
  return jwt.sign(
    payload,
    authConfig.jwtSecret,
    { expiresIn: '7d' }
  );
}; 