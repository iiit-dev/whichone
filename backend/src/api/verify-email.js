import express from "express";
import jwt from "jsonwebtoken";
import UsersModel from '../models/Users.js';
import VerificationCodesModel from '../models/VerificationCodes.js';
import config from "../config/auth.config.js";
import sequelize from '../database/index.js';

const User = UsersModel(sequelize);
const VerificationCodes = VerificationCodesModel(sequelize);
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { email, verificationCode } = req.body;
        
        if (!email || !verificationCode) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and verification code are required' 
            });
        }

        // Check if the user exists
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }
        
        // Retrieve the latest verification code for this email
        const storedVerification = await VerificationCodes.findOne({
            where: { email },
            order: [['created_at', 'DESC']]
        });
        
        if (!storedVerification) {
            return res.status(400).json({ 
                success: false, 
                error: 'No verification code found. Please request a new code.' 
            });
        }
        
        // Check if the code has expired
        if (new Date() > new Date(storedVerification.expires_at)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Verification code has expired. Please request a new code.' 
            });
        }
        
        // Check if the provided code matches the stored code
        if (verificationCode !== storedVerification.code) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid verification code. Please try again.' 
            });
        }
        
        // Mark user as verified
        user.isVerified = true;
        await user.save();
        
        // Delete the used verification code
        await VerificationCodes.destroy({ where: { id: storedVerification.id } });
        
        // Generate JWT token for authentication
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email },
            config.jwtSecret,
            { expiresIn: config.jwtExpiration }
        );
        
        // Return success with user data and token
        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            },
            token
        });

    } catch (error) {
        console.error("Error verifying email:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router; 