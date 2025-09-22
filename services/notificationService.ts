import { User, Device } from '../types';

/**
 * Interface representing a user with inactive devices
 * Used for compliance monitoring and notification purposes
 */
interface InactiveUser {
    user: User;                 // User information from Microsoft Graph API
    daysSinceLastSeen: number;  // Days since any of their devices was last active
    devices: Device[];          // Array of all devices associated with this user
}

/**
 * Main function to check for inactive devices and trigger notifications
 * Identifies users whose devices have been inactive for more than 14 days
 * Automatically sends email notifications for non-compliant users
 * 
 * Business Rules:
 * - 14-day threshold for device activity compliance
 * - Users are non-compliant if ALL their devices are inactive >14 days
 * - Notifications are sent via console logging (can be replaced with actual email service)
 * 
 * @param {User[]} users - Array of users from Microsoft Graph API
 * @param {Device[]} devices - Array of devices from Microsoft Defender API
 * @returns {InactiveUser[]} Array of users with inactive devices
 */
export const checkInactiveDevicesAndNotify = (users: User[], devices: Device[]): InactiveUser[] => {
    const userDeviceMap = new Map<string, Device[]>();
    const now = new Date();
    
    // Create a mapping of user IDs to their associated devices for efficient lookup
    devices.forEach(device => {
        if (!userDeviceMap.has(device.userId)) {
            userDeviceMap.set(device.userId, []);
        }
        userDeviceMap.get(device.userId)!.push(device);
    });

    const inactiveUsers: InactiveUser[] = [];

    // Analyze each user's device activity status
    users.forEach(user => {
        const userDevices = userDeviceMap.get(user.id) || [];
        
        // Skip users who don't have any registered devices
        if (userDevices.length === 0) return;

        let isActive = false;           // Flag to track if user has any active device
        let oldestLastSeen = now;       // Track the oldest last seen date among all devices

        // Check activity status for each device owned by the user
        userDevices.forEach(device => {
            if (device.lastSeen) {
                const lastSeenDate = new Date(device.lastSeen);
                const daysSinceLastSeen = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24));
                
                // If ANY device is active within 14 days, user is considered compliant
                if (daysSinceLastSeen <= 14) {
                    isActive = true;
                }
                
                // Track the oldest last seen date for reporting purposes
                if (lastSeenDate < oldestLastSeen) {
                    oldestLastSeen = lastSeenDate;
                }
            }
        });

        // If user has no active devices, add them to the inactive list
        if (!isActive) {
            const daysSinceLastSeen = Math.floor((now.getTime() - oldestLastSeen.getTime()) / (1000 * 60 * 60 * 24));
            inactiveUsers.push({ user, daysSinceLastSeen, devices: userDevices });
        }
    });

    // Trigger email notifications if there are users with inactive devices
    if (inactiveUsers.length > 0) {
        sendInactiveDeviceNotifications(inactiveUsers);
    }

    return inactiveUsers;
};

/**
 * Send email notifications to users with inactive devices
 * Currently logs to console - in production, would integrate with actual email service
 * 
 * Production Integration Options:
 * - Microsoft Graph API (Send Mail endpoint)
 * - SendGrid API
 * - AWS Simple Email Service (SES)
 * - Azure Communication Services
 * - SMTP server integration
 * 
 * @param {InactiveUser[]} inactiveUsers - Array of users with inactive devices
 */
const sendInactiveDeviceNotifications = (inactiveUsers: InactiveUser[]) => {
    // Alert header for console logging
    console.log('🚨 DEVICE ACTIVITY ALERT 🚨');
    console.log(`Found ${inactiveUsers.length} users with inactive devices (>14 days)`);
    
    // Process each inactive user for notification
    inactiveUsers.forEach(({ user, daysSinceLastSeen, devices }) => {
        console.log(`📧 Email Alert: ${user.displayName} (${user.mail})`);
        console.log(`   - Last device activity: ${daysSinceLastSeen} days ago`);
        console.log(`   - Devices: ${devices.map(d => d.deviceName).join(', ')}`);
        
        // Construct email content for the user
        const emailContent = {
            to: user.mail,
            subject: '🚨 Device Activity Alert - Action Required',
            body: `
Dear ${user.displayName},

Our security monitoring has detected that your registered devices have been inactive for ${daysSinceLastSeen} days.

Device Details:
${devices.map(d => `- ${d.deviceName} (Last seen: ${d.lastSeen ? new Date(d.lastSeen).toLocaleDateString() : 'Unknown'})`).join('\n')}

For security compliance, please ensure your devices are:
1. Connected to the network
2. Running Microsoft Defender
3. Receiving regular updates

If you need assistance, please contact IT support.

Best regards,
SecureOps Security Team
            `
        };
        
        // Log the email content (in production, this would actually send the email)
        console.log('📧 Email would be sent:', emailContent);
    });
    
    // TODO: Replace console logging with actual email service integration
    // Example implementations:
    // - Microsoft Graph: await graphClient.users(user.id).sendMail(emailContent).post()
    // - SendGrid: await sgMail.send(emailContent)
    // - AWS SES: await ses.sendEmail(emailContent).promise()
};

/**
 * Generate a comprehensive email report for administrators
 * Provides detailed summary of device activity compliance status
 * Used for management reporting and compliance auditing
 * 
 * @param {InactiveUser[]} inactiveUsers - Array of users with inactive devices
 * @returns {Object} Email object with subject and body content
 */
export const generateEmailReport = (inactiveUsers: InactiveUser[]) => {
    const reportDate = new Date().toLocaleDateString();
    
    return {
        subject: `Device Activity Compliance Report - ${reportDate}`,
        body: `
Device Activity Compliance Report
Generated: ${new Date().toLocaleString()}

Summary:
- Total users with inactive devices: ${inactiveUsers.length}
- Compliance threshold: 14 days

Inactive Users:
${inactiveUsers.map(({ user, daysSinceLastSeen, devices }) => `
• ${user.displayName} (${user.mail})
  Department: ${user.department || 'N/A'}
  Days since last activity: ${daysSinceLastSeen}
  Devices: ${devices.map(d => d.deviceName).join(', ')}
`).join('\n')}

Recommended Actions:
1. Contact inactive users to verify device status
2. Ensure devices are connected and updated
3. Review security policies for device activity requirements

This is an automated report from SecureOps.
        `
    };
};