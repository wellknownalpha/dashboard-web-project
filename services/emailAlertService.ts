export async function sendEmail(to: string, subject: string, body: string) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to, subject, body })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unknown error');
    
    console.log("📧 Email sent via backend API:", data.response);
  } catch (error) {
    console.error("❌ Email send error via backend:", error);
    throw error;
  }
}

export const EmailAlertServices = {
  sendEmail
};

