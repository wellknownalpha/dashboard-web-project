
import React, { useState } from 'react';
import { User, Device } from '../types';
import DeviceTable from './DeviceTable';
import UserAvatar from './UserAvatar';
import { ChevronDownIcon } from './icons';

interface UserCardProps {
    user: User;
    devices: Device[];
}

const UserCard: React.FC<UserCardProps> = ({ user, devices }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md transition-shadow hover:shadow-lg">
            <div
                className="flex items-center p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <UserAvatar user={user} className="mr-4" />
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                    <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.displayName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.mail}</p>
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.jobTitle}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.department}</p>
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{devices.length} Device{devices.length !== 1 ? 's' : ''}</p>
                        {devices.length > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Risk: {devices.filter(d => d.riskLevel === 'High').length} High, {devices.filter(d => d.riskLevel === 'Medium').length} Medium
                            </p>
                        )}
                    </div>
                    <div className="md:hidden">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{devices.length} Device{devices.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <ChevronDownIcon
                    className={`w-6 h-6 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isExpanded ? 'transform rotate-180' : ''}`}
                />
            </div>
            {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <DeviceTable devices={devices} />
                </div>
            )}
        </div>
    );
};

export default UserCard;
