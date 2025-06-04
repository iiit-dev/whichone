// Email Configuration
export default {
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'riteshraj400441@gmail.com',
      // Replace with an App Password - Generate one at https://myaccount.google.com/apppasswords
      pass: 'hfgojyjwnrvphfoe'
    }
  }, 
  fromEmail: 'riteshraj400441@gmail.com',
  fromName: 'WhichOne App',
  frontendUrl: 'http://localhost:3000'
};  