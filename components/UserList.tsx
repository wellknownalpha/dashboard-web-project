import React from 'react';
import { User, Device } from '../types';
import UserCard from './UserCard';

interface UserListProps {
    users: User[];
    devices: Device[];
    loading: boolean;
}

const UserList: React.FC<UserListProps> = ({ users, devices, loading }) => {
    if (loading) {
        return (
            <div className="space-y-4 p-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
                        <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 mr-4"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    if (users.length === 0) {
        return (
            <div className="text-center py-12 h-full flex flex-col justify-center items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">No users found</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filter.</p>
            </div>
        )
    }

    const unassignedDevices = devices.filter(d => d.userId === 'unknown' || !d.userId);
    const assignedDevices = devices.filter(d => d.userId !== 'unknown' && d.userId);
    
    return (
        <div className="space-y-4 p-4">
            {users.map((user) => (
                <UserCard
                    key={user.id}
                    user={user}
                    devices={devices.filter(d => d.userId === user.id)}
                />
            ))}
            {unassignedDevices.length > 0 && (
                <UserCard
                    key="unassigned"
                    user={{
                        id: 'unassigned',
                        displayName: 'Unassigned Devices',
                        mail: `${unassignedDevices.length} devices (${assignedDevices.length} assigned via tags)`,
                        jobTitle: 'System',
                        department: 'IT',
                        role: 'Viewer' as any,
                        photoUrl: 'https://i.pravatar.cc/150?u=system'
                    }}
                    devices={unassignedDevices}
                />
            )}
        </div>
    );
};

export default UserList;