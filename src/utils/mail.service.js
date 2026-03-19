const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer transporter using Gmail SMTP
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log('SMTP Connection Error:', error);
    } else {
        console.log('SMTP Server is ready to take our messages');
    }
});

/**
 * Reusable function to send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlTemplate - HTML content for the email
 */
const sendEmail = async (to, subject, htmlTemplate) => {
    try {
        const mailOptions = {
            from: `"Rishi Food Delivery" <${process.env.SMTP_EMAIL}>`,
            to,
            subject,
            html: htmlTemplate
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email could not be sent');
    }
};

module.exports = { sendEmail };
