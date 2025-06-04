/**
 * Validation utility functions
 */

/**
 * Validates username format
 * @param {string} username - The username to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidUsername = (username) => {
  if (!username) return false;
  
  // Validate username format (alphanumeric, 3-20 characters)
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Create username validation middleware
 * @param {Object} Users - Sequelize Users model
 * @returns {Function} Express middleware
 */
export const createUsernameValidator = (Users) => async (req, res, next) => {
  const { username } = req.body;
  
  // Check if username is provided
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  
  // Validate username format
  if (!isValidUsername(username)) {
    return res.status(400).json({ 
      error: 'Invalid username format. Username must be 3-20 characters and contain only letters, numbers, and underscores.' 
    });
  }
  
  try {
    // Check if username already exists
    const existingUser = await Users.findOne({ where: { username } });
    if (existingUser && existingUser.id !== req.user.id) {
      return res.status(409).json({ error: 'Username already taken' });
    }
    next();
  } catch (error) {
    console.error('Error validating username:', error);
    return res.status(500).json({ error: 'Server error during validation' });
  }
}; 