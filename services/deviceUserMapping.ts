import { User, Device } from '../types';

export const mapDevicesToUsers = (users: User[], devices: Device[]) => {
    return devices.map(device => {
        let matchedUser = null;
        
        // Strategy 1: Direct Azure AD ID match
        if (device.userId && device.userId !== 'unknown') {
            matchedUser = users.find(user => user.id === device.userId);
        }
        
        // Strategy 2: Machine tags contain email addresses
        if (!matchedUser && device.machineTags && device.machineTags.length > 0) {
            for (const tag of device.machineTags) {
                // Extract email from tag (handles formats like "user:email@domain.com" or just "email@domain.com")
                const emailMatch = tag.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
                if (emailMatch) {
                    const tagEmail = emailMatch[1].toLowerCase();
                    matchedUser = users.find(user => 
                        user.mail?.toLowerCase() === tagEmail
                    );
                    if (matchedUser) break;
                }
            }
        }
        
        return {
            ...device,
            userId: matchedUser?.id || device.userId,
            matchedUser: matchedUser
        } as Device & { matchedUser?: User };
    });
};