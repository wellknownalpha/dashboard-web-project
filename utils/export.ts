import { User, Device } from '../types';

export const exportUsersToCsv = (users: User[], allDevices: Device[], filename: string) => {
    const headers = [
        'User Display Name',
        'User Email',
        'User Job Title',
        'User Department',
        'Device Name',
        'Device OS',
        'Device Health Status',
        'Device Risk Level',
        'Device Last Seen'
    ];

    const userMap = new Map(users.map(u => [u.id, u]));

    const rows = allDevices
        .filter(device => userMap.has(device.userId))
        .map(device => {
            const user = userMap.get(device.userId);
            if (!user) return null;

            return [
                user.displayName,
                user.mail,
                user.jobTitle,
                user.department,
                device.deviceName,
                device.os,
                device.healthStatus,
                device.riskLevel,
                new Date(device.lastSeen).toISOString()
            ].join(',');
        })
        .filter(row => row !== null);

    const csvContent = [
        headers.join(','),
        ...rows
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
        URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
