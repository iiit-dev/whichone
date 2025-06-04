import passport from 'passport';

/**
 * Authentication middleware using Passport JWT strategy
 * Verifies the JWT token in the request header
 */
export const authenticate = passport.authenticate('jwt', { session: false });

/**
 * Middleware to extract and set userId from req.user
 * Must be used after authenticate middleware
 */
export const extractUserId = (req, res, next) => {
  if (req.user && req.user.id) {
    req.userId = req.user.id;
  }
  next();
};

/**
 * Authorization middleware
 * Ensures authenticated user can only access their own resources
 * @param {string} paramName - Name of the parameter containing the user ID to check against
 */
export const authorizeUser = (paramName = 'userId') => (req, res, next) => {
  const requestedUserId = parseInt(req.params[paramName]);
  
  // Verify JWT authentication was successful
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if user is trying to access their own resources
  if (req.user.id !== requestedUserId) {
    return res.status(403).json({ 
      error: 'Unauthorized: You can only access or modify your own resources' 
    });
  }
  
  next();
};

/**
 * Combined authentication and authorization middleware
 * @param {string} paramName - Name of the parameter containing the user ID to check against
 */
export const authenticateAndAuthorize = (paramName = 'userId') => [
  authenticate,
  authorizeUser(paramName)
]; 