import { User, Device } from '../types';

/**
 * Individual Email Service for sending alerts to specific users
 */
export class IndividualEmailService {
    
    /**
     * Send email alert to a specific non-compliant user
     */
    static async sendUserAlert(user: User, devices: Device[], daysSinceLastSeen: number): Promise<boolean> {
        try {
            const emailContent = {
                to: user.mail,
                subject: '🚨 Device Activity Alert - Action Required',
                body: `
Dear ${user.displayName},

Our security monitoring has detected that your registered devices have been inactive for ${daysSinceLastSeen} days.

📱 Your Devices:
${devices.map(d => `• ${d.deviceName} (Last seen: ${d.lastSeen ? new Date(d.lastSeen).toLocaleDateString() : 'Unknown'})`).join('\n')}

⚠️ Security Compliance Requirements:
To maintain security compliance, please ensure your devices are:
1. ✅ Connected to the corporate network
2. ✅ Running Microsoft Defender
3. ✅ Receiving regular security updates
4. ✅ Active within the last 14 days

🔧 Next Steps:
- Turn on your device and connect to the network
- Ensure Microsoft Defender is running
- Contact IT support if you need assistance

📞 Need Help?
Contact IT Helpdesk: support@company.com

Best regards,
SecureOps Security Team
                `
            };

            // Simulate email sending
            console.log('📧 INDIVIDUAL ALERT SENT:', {
                recipient: user.mail,
                name: user.displayName,
                daysSinceLastSeen,
                deviceCount: devices.length,
                timestamp: new Date().toISOString()
            });

            return true;
        } catch (error) {
            console.error('Failed to send email to', user.displayName, error);
            return false;
        }
    }
}
