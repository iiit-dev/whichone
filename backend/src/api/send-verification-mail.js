import nodemailer from "nodemailer";
import express from "express";
import emailConfig from '../config/email.config.js';
import VerificationCodesModel from '../models/VerificationCodes.js';
import sequelize from '../database/index.js';

const router = express.Router();
const VerificationCodes = VerificationCodesModel(sequelize);

// Create transporter using email configuration
const transporter = nodemailer.createTransport(emailConfig.smtp);

// Verify transporter on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ SMTP connection failed:', error);
    } else {
        console.log('✅ SMTP server is ready to send emails');
    }
});

// Function to generate a 4-digit verification code
const generateVerificationCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// Function to generate expiration time (2 minutes from now)
const generateExpirationTime = () => {
    const expirationTime = new Date();
    expirationTime.setSeconds(expirationTime.getSeconds() + 120); // 2 minutes expiration
    return expirationTime;
};

router.post('/', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        const verificationCode = generateVerificationCode();
        const expirationTime = generateExpirationTime();
        
        console.log(`📧 Sending verification email to: ${email}`);
        console.log(`🔢 Verification code: ${verificationCode}`);
        
        // Delete any existing verification codes for this email
        await VerificationCodes.destroy({ where: { email } });
        
        // Store the verification code in the database
        await VerificationCodes.create({
            email,
            code: verificationCode,
            expires_at: expirationTime,
            created_at: new Date()
        });
        
        console.log(`⏰ Verification code ${verificationCode} will expire at: ${expirationTime.toLocaleString()}`);

        const info = await transporter.sendMail({
            from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
            to: email,
            subject: "Your Verification Code - WhichOne",
            text: `Your verification code is: ${verificationCode}\n\nPlease use this code to verify your account. This code will expire in 2 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Verify Your Account</h2>
                    <p>Thank you for registering with WhichOne! Please use the following code to verify your account:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0; border-radius: 8px;">
                        <strong>${verificationCode}</strong>
                    </div>
                    <p>This code will expire in 2 minutes.</p>
                    <p>If you didn't request this verification code, please ignore this email.</p>
                </div>
            `,
        });
        
        console.log("✅ Verification email sent successfully!");
        console.log("📨 Message ID:", info.messageId);
        console.log("🔄 Response:", info.response);
        
        res.status(200).json({ 
            success: true, 
            message: 'Verification email sent successfully',
            messageId: info.messageId,
            verificationCode: verificationCode // Include for development/testing
        });
        
    } catch (error) {
        console.error("❌ Error sending verification email:", error);
        console.error("Error details:", {
            code: error.code,
            command: error.command,
            response: error.response
        });
        
        res.status(500).json({ 
            success: false,
            error: error.message || 'Failed to send verification email',
            details: process.env.NODE_ENV === 'development' ? error.code : undefined
        });
    }
});

export default router;
 