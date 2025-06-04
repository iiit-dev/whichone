import { Router } from 'express';
const router = Router();
import UsersModel from '../models/Users.js';
import sequelize from '../database/index.js';
import crypto from 'crypto';

const Users = UsersModel(sequelize);

// Helper function to extract username from email
function extractUsername(email) {
  // Split the email at @ and take the first part
  return email.split('@')[0];
}

// Helper function to hash password
function hashPassword(password) {
  const hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}

// http://0.0.0.0:6000/api/v1/register
router.post('/', async (req, res) => {
  console.log('Registration attempt received:', req.body);
  const { name, email, password } = req.body;

  try {
    console.log('Checking if user exists...');
    const alreadyExists = await Users.findOne({ where: { email } });

    if (alreadyExists) {
      console.log('User already exists with email:', email);
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    console.log('Hashing password...');
    const password_hash = hashPassword(password);

    console.log('Creating new user...');
    const newUser = new Users({
      name,
      email,
      password_hash,
      username: extractUsername(email)
    });

    console.log('Attempting to save user...');
    const savedUser = await newUser.save();
    
    console.log('User saved successfully:', savedUser.id);
    return res.status(200).json({ 
      message: 'Registration successful! You can now log in.',
      username: savedUser.username
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(400).json({
      error: 'Registration failed. Cannot create user at the moment',
      details: err.message
    });
  }
});

export default router;
