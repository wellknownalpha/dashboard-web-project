import { User, Device } from '../types';

/**
 * Maps devices to users using multiple strategies:
 * 1. Direct userId match
 * 2. Email address matching
 * 3. Machine tags containing email addresses
 */
export function mapDevicesToUsers(users: User[], devices: Device[]): Device[] {
    console.log('🔗 Starting device-user mapping process...');
    console.log(`📊 Input: ${users.length} users, ${devices.length} devices`);

    // Create lookup maps for efficient matching
    const userByEmail = new Map<string, User>();
    const userById = new Map<string, User>();
    
    users.forEach(user => {
        if (user.mail) {
            userByEmail.set(user.mail.toLowerCase(), user);
        }
        userById.set(user.id, user);
    });

    const mappedDevices = devices.map(device => {
        let matchedUser: User | undefined;
        let matchMethod = 'none';

        // Strategy 1: Direct userId match
        if (device.userId && userById.has(device.userId)) {
            matchedUser = userById.get(device.userId);
            matchMethod = 'userId';
        }
        
        // Strategy 2: Email address matching
        if (!matchedUser && device.userEmail) {
            const email = device.userEmail.toLowerCase();
            if (userByEmail.has(email)) {
                matchedUser = userByEmail.get(email);
                matchMethod = 'email';
            }
        }

        // Strategy 3: Machine tags containing email addresses
        if (!matchedUser && device.machineTags && device.machineTags.length > 0) {
            for (const tag of device.machineTags) {
                // Look for email patterns in machine tags
                const emailMatch = tag.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
                if (emailMatch) {
                    const tagEmail = emailMatch[1].toLowerCase();
                    if (userByEmail.has(tagEmail)) {
                        matchedUser = userByEmail.get(tagEmail);
                        matchMethod = 'machineTag';
                        break;
                    }
                }
            }
        }

        // Return device with mapped user information
        const mappedDevice: Device = {
            ...device,
            userId: matchedUser?.id || 'unknown',
            userEmail: matchedUser?.mail || device.userEmail || 'unknown@company.com',
            userName: matchedUser?.displayName || 'Unknown User'
        };

        if (matchedUser) {
            console.log(`✅ Mapped device ${device.deviceName} to user ${matchedUser.displayName} via ${matchMethod}`);
        } else {
            console.log(`❌ No user match found for device ${device.deviceName}`);
        }

        return mappedDevice;
    });

    // Log mapping statistics
    const mappingStats = {
        total: mappedDevices.length,
        mapped: mappedDevices.filter(d => d.userId !== 'unknown').length,
        unmapped: mappedDevices.filter(d => d.userId === 'unknown').length
    };

    console.log('📈 Device mapping completed:', mappingStats);
    console.log(`✅ Success rate: ${((mappingStats.mapped / mappingStats.total) * 100).toFixed(1)}%`);

    return mappedDevices;
}

/**
 * Gets devices associated with a specific user
 */
export function getDevicesForUser(userId: string, devices: Device[]): Device[] {
    return devices.filter(device => device.userId === userId);
}

/**
 * Gets users who have devices at a specific risk level
 */
export function getUsersWithRiskLevel(riskLevel: string, users: User[], devices: Device[]): User[] {
    const userIdsWithRisk = new Set<string>();
    
    devices.forEach(device => {
        if (device.riskLevel === riskLevel) {
            userIdsWithRisk.add(device.userId);
        }
    });

    return users.filter(user => userIdsWithRisk.has(user.id));
}