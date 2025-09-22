import { User, Device } from '../types';

interface InactiveUser {
    user: User;
    daysSinceLastSeen: number;
    devices: Device[];
}

/**
 * Enhanced Email Alert Service for Non-Compliant Users
 * Sends targeted email notifications to users with inactive devices
 */
export class EmailAlertService {
    
    /**
     * Send email alerts to non-compliant users based on device activity
     * @param users - Array of all users
     * @param devices - Array of all devices
     * @returns Promise with alert results
     */
    static async sendComplianceAlerts(users: User[], devices: Device[]): Promise<{
        success: boolean;
        alertsSent: number;
        errors: string[];
    }> {
        const inactiveUsers = this.getInactiveUsers(users, devices);
        const results = {
            success: true,
            alertsSent: 0,
            errors: [] as string[]
        };

        if (inactiveUsers.length === 0) {
            return { ...results, alertsSent: 0 };
        }

        // Send individual alerts to each non-compliant user
        for (const inactiveUser of inactiveUsers) {
            try {
                await this.sendUserAlert(inactiveUser);
                results.alertsSent++;
            } catch (error) {
                results.errors.push(`Failed to send alert to ${inactiveUser.user.displayName}: ${error}`);
                results.success = false;
            }
        }

        // Send summary report to administrators
        await this.sendAdminSummary(inactiveUsers);

        return results;
    }

    /**
     * Send individual email alert to non-compliant user
     */
    private static async sendUserAlert(inactiveUser: InactiveUser): Promise<void> {
        const { user, daysSinceLastSeen, devices } = inactiveUser;
        
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
1. ✅ Connected to Defender using dvsum email id
2. ✅ Running Microsoft Defender
3. ✅ Receiving regular security updates
4. ✅ Active within the last 14 days

🔧 Next Steps:
- Turn on your device and connect to the network
- Ensure Microsoft Defender is running
- Contact IT support if you need assistance

📞 Need Help?
If you have questions or need technical assistance, please contact:
- IT Helpdesk: helpdesk@dvsum.com

This is an automated security compliance notification.

Best regards,
SecureOps Security Team
            `,
            priority: 'high',
            category: 'security-compliance'
        };

        // Simulate email sending (replace with actual email service)
        console.log('📧 COMPLIANCE ALERT SENT:', {
            recipient: user.mail,
            subject: emailContent.subject,
            daysSinceLastSeen,
            deviceCount: devices.length
        });

        // In production, integrate with email service:
        // await emailService.send(emailContent);
    }

    /**
     * Send summary report to administrators
     */
    private static async sendAdminSummary(inactiveUsers: InactiveUser[]): Promise<void> {
        const adminEmail = {
            to: 'admin@company.com',
            subject: `📊 Device Compliance Alert Summary - ${inactiveUsers.length} Non-Compliant Users`,
            body: `
Device Activity Compliance Report
Generated: ${new Date().toLocaleString()}

📈 Summary:
• Total non-compliant users: ${inactiveUsers.length}
• Compliance threshold: 14 days
• Alert status: Notifications sent

👥 Non-Compliant Users:
${inactiveUsers.map(({ user, daysSinceLastSeen, devices }) => `
• ${user.displayName} (${user.mail})
  Department: ${user.department || 'N/A'}
  Days inactive: ${daysSinceLastSeen}
  Devices: ${devices.length} (${devices.map(d => d.deviceName).join(', ')})
`).join('\n')}

🎯 Recommended Actions:
1. Follow up with users who don't respond within 48 hours
2. Review device policies for frequently inactive users
3. Consider additional security measures for high-risk cases

This is an automated compliance report.
            `
        };

        console.log('📧 ADMIN SUMMARY SENT:', {
            nonCompliantCount: inactiveUsers.length,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Get list of users with inactive devices
     */
    private static getInactiveUsers(users: User[], devices: Device[]): InactiveUser[] {
        const userDeviceMap = new Map<string, Device[]>();
        const now = new Date();
        
        devices.forEach(device => {
            if (!userDeviceMap.has(device.userId)) {
                userDeviceMap.set(device.userId, []);
            }
            userDeviceMap.get(device.userId)!.push(device);
        });

        const inactiveUsers: InactiveUser[] = [];

        users.forEach(user => {
            const userDevices = userDeviceMap.get(user.id) || [];
            if (userDevices.length === 0) return;

            let isActive = false;
            let oldestLastSeen = now;

            userDevices.forEach(device => {
                if (device.lastSeen) {
                    const lastSeenDate = new Date(device.lastSeen);
                    const daysSinceLastSeen = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24));
                    
                    if (daysSinceLastSeen <= 14) {
                        isActive = true;
                    }
                    
                    if (lastSeenDate < oldestLastSeen) {
                        oldestLastSeen = lastSeenDate;
                    }
                }
            });

            if (!isActive) {
                const daysSinceLastSeen = Math.floor((now.getTime() - oldestLastSeen.getTime()) / (1000 * 60 * 60 * 24));
                inactiveUsers.push({ user, daysSinceLastSeen, devices: userDevices });
            }
        });

        return inactiveUsers;
    }
}