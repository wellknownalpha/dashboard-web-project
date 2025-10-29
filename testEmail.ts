import { sendEmail } from './services/emailAlertService';

(async () => {
  try {
    await sendEmail(
      'your-email@gmail.com',            // <-- Replace with your real email
      '✅ Test Email from App',
      'Hello, this is a test email sent directly using sendEmail().'
    );
    console.log("🎉 Test email sent successfully!");
  } catch (err) {
    console.error("❌ Failed to send test email:", err);
  }
})();

