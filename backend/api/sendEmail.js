const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Load email credentials from environment variables (recommended)
const EMAIL_USER = process.env.EMAIL_USER ;
const EMAIL_PASS = process.env.EMAIL_PASS ;

if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error("❌ EMAIL_USER or EMAIL_PASS not set in environment variables.");
}


// POST /api/send-email
router.post('/send-email', async (req, res) => {
    const { to, subject, body } = req.body;

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: EMAIL_USER,
            to,
            subject,
            text: body,
        });

        console.log(`📧 Email sent to ${to}: ${info.response}`);
        res.json({ success: true, response: info.response });
    } catch (error) {
        console.error("❌ Failed to send email:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

