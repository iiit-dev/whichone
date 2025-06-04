import nodemailer from "nodemailer";
import emailConfig from './src/config/email.config.js';

console.log('🔧 Testing email configuration...');
console.log('Email config:', emailConfig.smtp);

// Create transporter
const transporter = nodemailer.createTransport(emailConfig.smtp);

// Test the connection
async function testEmailConnection() {
    try {
        console.log('🔍 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully!');
        
        console.log('📧 Sending test email...');
        const info = await transporter.sendMail({
            from: emailConfig.smtp.auth.user, // Use the authenticated email as sender
            to: emailConfig.smtp.auth.user, // Send to yourself for testing
            subject: "Test Email - WhichOne App",
            text: "This is a test email to verify email functionality.",
            html: "<h3>Test Email</h3><p>This is a test email to verify email functionality.</p>"
        });
        
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        
    } catch (error) {
        console.error('❌ Email test failed:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        if (error.code === 'EAUTH') {
            console.error('🔑 Authentication failed. Possible issues:');
            console.error('1. App password is incorrect');
            console.error('2. 2-step verification is not enabled on Gmail');
            console.error('3. App password was not generated correctly');
        } else if (error.code === 'ENOTFOUND') {
            console.error('🌐 DNS/Network issue. Check internet connection.');
        } else if (error.code === 'ECONNECTION') {
            console.error('🔌 Connection issue. Check SMTP settings.');
        }
    }
}

testEmailConnection(); 