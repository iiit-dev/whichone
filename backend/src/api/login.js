import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import UsersModel from '../models/Users.js';
import sequelize from '../database/index.js';
import authConfig from '../config/auth.config.js';

const Users = UsersModel(sequelize);
const router = express.Router();

function hashPassword(password) { 
    const hash = crypto.createHash('sha256');
    hash.update(password);
    return hash.digest('hex');
} 

const secretKey = authConfig.jwtSecret;

router.post('/', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const userWithEmail = await Users.findOne({ where: { email } });
        
        if (!userWithEmail) {
            return res.status(400).json({ error: 'User with this email does not exist' });
        }
        
        if (userWithEmail.password_hash !== hashPassword(password)) {
            return res.status(400).json({ error: 'Password is incorrect' });
        }
        
        // Check if user is verified
        if (!userWithEmail.isVerified) {
            return res.status(403).json({ 
                error: 'Email not verified',
                needsVerification: true,
                email: userWithEmail.email
            });
        }
        
        const jwtToken = jwt.sign({
            id: userWithEmail.id, 
            name: userWithEmail.name, 
            email: userWithEmail.email
        }, secretKey);
                
        return res.status(200).json({
            message: 'Login successful',
            token: jwtToken,
            user: {
                id: userWithEmail.id,
                name: userWithEmail.name,
                email: userWithEmail.email,
                username: userWithEmail.username,
                isVerified: userWithEmail.isVerified
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Login failed' });
    }
});

export default router;
