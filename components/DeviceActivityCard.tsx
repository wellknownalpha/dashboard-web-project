import React from 'react';
import { User, Device } from '../types';
import DeviceActivityChart from './DeviceActivityChart';

/**
 * Interface defining device activity statistics
 * Used to track user compliance based on device activity within 14-day threshold
 */
interface DeviceActivityStats {
    totalUsersWithDevices: number;                                    // Total users who have registered devices
    activeUsers: number;                                              // Users with devices active within 14 days
    inactiveUsers: number;                                            // Users with all devices inactive >14 days
    activityRate: number;                                             // Percentage of users with active devices
    inactiveUsersList: { user: User; daysSinceLastSeen: number }[];   // Detailed list of inactive users
}

/**
 * Props interface for DeviceActivityCard component
 */
interface DeviceActivityCardProps {
    users: User[];     // Array of Microsoft Graph API users
    devices: Device[]; // Array of Microsoft Defender devices
}

/**
 * Device Activity Compliance Card Component
 * Monitors user compliance based on device activity within the last 14 days
 * Displays activity statistics and identifies users with inactive devices
 * 
 * Business Logic:
 * - Users are considered compliant if they have at least one device active within 14 days
 * - Inactive users are those whose ALL devices haven't been seen for >14 days
 * - Activity rate is calculated as (active users / total users with devices) * 100
 */
const DeviceActivityCard: React.FC<DeviceActivityCardProps> = ({ users, devices }) => {
    /**
     * Calculate device activity statistics for compliance monitoring
     * @returns {DeviceActivityStats} Comprehensive activity statistics
     */
    const getDeviceActivityStats = (): DeviceActivityStats => {
        const userDeviceMap = new Map<string, Device[]>();
        const now = new Date();
        
        // Group devices by user ID for efficient processing
        devices.forEach(device => {
            if (!userDeviceMap.has(device.userId)) {
                userDeviceMap.set(device.userId, []);
            }
            userDeviceMap.get(device.userId)!.push(device);
        });

        // Filter users who have registered devices
        const usersWithDevices = users.filter(user => userDeviceMap.has(user.id));
        const activeUsers: User[] = [];
        const inactiveUsersList: { user: User; daysSinceLastSeen: number }[] = [];

        // Analyze each user's device activity status
        usersWithDevices.forEach(user => {
            const userDevices = userDeviceMap.get(user.id) || [];
            let isActive = false;           // Flag to track if user has any active device
            let oldestLastSeen = now;       // Track oldest last seen date for inactive users

            // Check activity status for each of the user's devices
            userDevices.forEach(device => {
                if (device.lastSeen) {
                    const lastSeenDate = new Date(device.lastSeen);
                    const daysSinceLastSeen = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24));
                    
                    // If any device is active within 14 days, user is considered active
                    if (daysSinceLastSeen <= 14) {
                        isActive = true;
                    }
                    
                    // Track the oldest last seen date for reporting purposes
                    if (lastSeenDate < oldestLastSeen) {
                        oldestLastSeen = lastSeenDate;
                    }
                }
            });

            // Categorize user based on device activity
            if (isActive) {
                activeUsers.push(user);
            } else {
                // Calculate days since last activity for inactive users
                const daysSinceLastSeen = Math.floor((now.getTime() - oldestLastSeen.getTime()) / (1000 * 60 * 60 * 24));
                inactiveUsersList.push({ user, daysSinceLastSeen });
            }
        });

        // Calculate activity compliance rate as percentage
        const activityRate = usersWithDevices.length > 0 ? (activeUsers.length / usersWithDevices.length) * 100 : 0;

        return {
            totalUsersWithDevices: usersWithDevices.length,
            activeUsers: activeUsers.length,
            inactiveUsers: inactiveUsersList.length,
            activityRate,
            inactiveUsersList
        };
    };

    // Calculate current activity statistics
    const stats = getDeviceActivityStats();



    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-full flex flex-col">
            <h3 className="text-lg font-semibold p-4 border-b border-gray-200 dark:border-gray-700">Device Compliance as per active status</h3>
            <div className="p-4 flex-grow overflow-auto">
                <DeviceActivityChart 
                    activeUsers={stats.activeUsers}
                    inactiveUsers={stats.inactiveUsers}
                    activityRate={stats.activityRate}
                />
            </div>
        </div>
    );
};

export default DeviceActivityCard;