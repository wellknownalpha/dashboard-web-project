import React from 'react';

interface UserAvatarProps {
    user: {
        displayName: string;
        photoUrl?: string | null;
    };
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md', className = '' }) => {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    };

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-12 h-12 text-sm',
        lg: 'w-16 h-16 text-lg'
    };

    const getBackgroundColor = (name: string) => {
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
            'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    if (user.photoUrl) {
        return (
            <img
                className={`${sizeClasses[size]} rounded-full ${className}`}
                src={user.photoUrl}
                alt={user.displayName}
            />
        );
    }

    return (
        <div
            className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold ${getBackgroundColor(user.displayName)} ${className}`}
        >
            {getInitials(user.displayName)}
        </div>
    );
};

export default UserAvatar;