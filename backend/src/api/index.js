import express from 'express';
// routes
import emojis from './emojis.js';
import register from './register.js';
import login from './login.js';
import payments from './payments.js';
import user from './user.js';
import polls from './polls.js';
import uploadImage from './upload-image.js';
import profile from './profile.js';
import sendVerificationMail from './send-verification-mail.js'; 
import verifyEmail from './verify-email.js';
import wallet from './wallet.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏', 
  });
});

router.use('/emojis', emojis); // http://0.0.0.0:6000/api/v1/emojis
router.use('/register', register); // http://0.0.0.0:6000/api/v1/register
router.use('/login', login); // http://0.0.0.0:6000/api/v1/login
router.use('/payments', payments); // http://0.0.0.0:6000/api/v1/payments
router.use('/user', user); // http://0.0.0.0:6000/api/v1/user/1
router.use('/polls', polls); // http://0.0.0.0:6000/api/v1/polls
router.use('/upload-image', uploadImage); // http://0.0.0.0:6000/api/v1/upload-image
router.use('/profile', profile); // http://0.0.0.0:6000/api/v1/profile/
router.use('/send-verification-mail', sendVerificationMail); // http://0.0.0.0:6000/api/v1/send-verification-mail
router.use('/verify-email', verifyEmail); // http://0.0.0.0:6000/api/v1/verify-email
router.use('/wallet', wallet); // http://0.0.0.0:6000/api/v1/wallet

export default router;
