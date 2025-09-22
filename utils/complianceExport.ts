import { User, Device } from '../types';

interface ComplianceData {
    user: User;
    isCompliant: boolean;
    deviceCount: number;
    devices: Device[];
    riskLevel: string;
}

export const exportComplianceReport = (
    users: User[], 
    devices: Device[], 
    filename: string = `Compliance-Report-${new Date().toISOString().split('T')[0]}.csv`
) => {
    // Only consider users who have Defender licenses
    const licensedUserIds = new Set([...users.map(u => u.id), ...devices.map(d => d.userId)]);
    const licensedUsers = users.filter(user => licensedUserIds.has(user.id));
    
    // Create compliance data
    const complianceData: ComplianceData[] = licensedUsers.map(user => {
        const userDevices = devices.filter(device => device.userId === user.id);
        const isCompliant = userDevices.length > 0;
        const highestRisk = userDevices.length > 0 
            ? userDevices.reduce((highest, device) => {
                const riskOrder = { 'Low': 1, 'Medium': 2, 'High': 3 };
                return riskOrder[device.riskLevel] > riskOrder[highest] ? device.riskLevel : highest;
            }, 'Low')
            : 'Unprotected';

        return {
            user,
            isCompliant,
            deviceCount: userDevices.length,
            devices: userDevices,
            riskLevel: highestRisk
        };
    });

    // Calculate summary stats
    const totalUsers = licensedUsers.length;
    const compliantUsers = complianceData.filter(d => d.isCompliant).length;
    const nonCompliantUsers = totalUsers - compliantUsers;
    const complianceRate = totalUsers > 0 ? (compliantUsers / totalUsers) * 100 : 0;

    // Create CSV content
    const headers = [
        'User Name',
        'Email',
        'Department',
        'Job Title',
        'Compliance Status',
        'Device Count',
        'Highest Risk Level',
        'Device Names',
        'Last Seen Devices'
    ];

    const csvRows = [
        // Summary section
        ['COMPLIANCE SUMMARY'],
        ['Total Users', totalUsers.toString()],
        ['Compliant Users', compliantUsers.toString()],
        ['Non-Compliant Users', nonCompliantUsers.toString()],
        ['Compliance Rate', `${complianceRate.toFixed(1)}%`],
        ['Report Generated', new Date().toLocaleString()],
        [''], // Empty row
        
        // Headers
        headers,
        
        // Data rows
        ...complianceData.map(data => [
            data.user.displayName,
            data.user.mail,
            data.user.department || 'N/A',
            data.user.jobTitle || 'N/A',
            data.isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT',
            data.deviceCount.toString(),
            data.riskLevel,
            data.devices.map(d => d.computerDnsName || d.id).join('; '),
            data.devices.map(d => d.lastSeen ? new Date(d.lastSeen).toLocaleDateString() : 'Unknown').join('; ')
        ])
    ];

    // Convert to CSV string
    const csvContent = csvRows.map(row => 
        row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const getComplianceStats = (users: User[], devices: Device[]) => {
    const userDeviceMap = new Map<string, Device[]>();
    
    // Group devices by user
    devices.forEach(device => {
        if (!userDeviceMap.has(device.userId)) {
            userDeviceMap.set(device.userId, []);
        }
        userDeviceMap.get(device.userId)!.push(device);
    });

    // Only consider users who have Defender licenses
    const licensedUserIds = new Set([...users.map(u => u.id), ...devices.map(d => d.userId)]);
    const licensedUsers = users.filter(user => licensedUserIds.has(user.id));

    const compliantUsers = licensedUsers.filter(user => {
        const userDevices = userDeviceMap.get(user.id) || [];
        return userDevices.length > 0;
    });

    const nonCompliantUsers = licensedUsers.filter(user => {
        const userDevices = userDeviceMap.get(user.id) || [];
        return userDevices.length === 0;
    });

    const complianceRate = licensedUsers.length > 0 ? (compliantUsers.length / licensedUsers.length) * 100 : 0;

    return {
        totalUsers: licensedUsers.length,
        compliantUsers: compliantUsers.length,
        nonCompliantUsers: nonCompliantUsers.length,
        complianceRate,
        compliantUsersList: compliantUsers,
        nonCompliantUsersList: nonCompliantUsers
    };
};