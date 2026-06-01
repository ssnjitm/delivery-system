import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Force load .env from root directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// // Debug: Log what's being loaded
// console.log('Current working directory:', process.cwd());
// console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
// console.log('EMAIL_USER value:', process.env.EMAIL_USER);
// console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
// console.log('EMAIL_PASS length:', process.env.EMAIL_PASS?.length || 0);

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, // Use an App Password, not your real password
  },
});

// import nodemailer from 'nodemailer';

// // Create test account on the fly
// export const createTransporter = async () => {
//     const testAccount = await nodemailer.createTestAccount();
    
//     return nodemailer.createTransport({
//         host: 'smtp.ethereal.email',
//         port: 587,
//         secure: false,
//         auth: {
//             user: testAccount.user,
//             pass: testAccount.pass,
//         },
//     });
// };

// // Or use a fixed one (get credentials from https://ethereal.email)
// export const transporter = nodemailer.createTransport({
//     host: 'smtp.ethereal.email',
//     port: 587,
//     secure: false,
//     auth: {
//         user: 'your-ethereal-username@ethereal.email',
//         pass: 'your-ethereal-password',
//     },
// });