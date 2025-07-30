import { User, Device, RiskLevel, HealthStatus, UserRole } from '../types';

const mockUsers: User[] = [
    { id: 'user1', displayName: 'Adele Vance', mail: 'adele.vance@contoso.com', jobTitle: 'Product Manager', department: 'Product', role: UserRole.Admin },
    { id: 'user2', displayName: 'Alex Wilber', mail: 'alex.wilber@contoso.com', jobTitle: 'Software Engineer', department: 'Engineering', role: UserRole.Viewer },
    { id: 'user3', displayName: 'Bianca Pisani', mail: 'bianca.pisani@contoso.com', jobTitle: 'UX Designer', department: 'Design', role: UserRole.Viewer },
    { id: 'user4', displayName: 'Cameron White', mail: 'cameron.white@contoso.com', jobTitle: 'Marketing Lead', department: 'Marketing', role: UserRole.Viewer },
    { id: 'user5', displayName: 'Diego Siciliani', mail: 'diego.siciliani@contoso.com', jobTitle: 'DevOps Engineer', department: 'Engineering', role: UserRole.Viewer },
    { id: 'user6', displayName: 'Emily Johnson', mail: 'emily.johnson@contoso.com', jobTitle: 'Data Scientist', department: 'Analytics', role: UserRole.Viewer },
    { id: 'user7', displayName: 'Frank Miller', mail: 'frank.miller@contoso.com', jobTitle: 'IT Support Specialist', department: 'IT', role: UserRole.Viewer },
];

const mockDevices: Device[] = [
    // Existing data
    { id: 'dev1', userId: 'user1', deviceName: 'AV-LAPTOP-01', os: 'Windows 11', healthStatus: HealthStatus.Healthy, riskLevel: RiskLevel.Low, lastSeen: '2024-07-28T10:00:00Z' },
    { id: 'dev2', userId: 'user1', deviceName: 'AV-PHONE-01', os: 'iOS 17.5', healthStatus: HealthStatus.Healthy, riskLevel: RiskLevel.Low, lastSeen: '2024-07-28T12:30:00Z' },
    { id: 'dev3', userId: 'user2', deviceName: 'AW-DESKTOP-01', os: 'Windows 11', healthStatus: HealthStatus.AtRisk, riskLevel: RiskLevel.High, lastSeen: '2024-07-27T15:00:00Z' },
    { id: 'dev4', userId: 'user2', deviceName: 'AW-LAPTOP-02', os: 'macOS Sonoma', healthStatus: HealthStatus.Healthy, riskLevel: RiskLevel.Low, lastSeen: '2024-07-28T09:00:00Z' },
    { id: 'dev5', userId: 'user3', deviceName: 'BP-LAPTOP-01', os: 'macOS Sonoma', healthStatus: HealthStatus.Inactive, riskLevel: RiskLevel.Unknown, lastSeen: '2024-06-15T11:00:00Z' },
    { id: 'dev6', userId: 'user4', deviceName: 'CW-SURFACE-01', os: 'Windows 11', healthStatus: HealthStatus.AtRisk, riskLevel: RiskLevel.Medium, lastSeen: '2024-07-28T08:45:00Z' },
    { id: 'dev7', userId: 'user5', deviceName: 'DS-SERVER-01', os: 'Ubuntu 22.04', healthStatus: HealthStatus.Healthy, riskLevel: RiskLevel.Low, lastSeen: '2024-07-28T13:00:00Z' },
    { id: 'dev8', userId: 'user6', deviceName: 'EJ-LAPTOP-03', os: 'Windows 11', healthStatus: HealthStatus.AtRisk, riskLevel: RiskLevel.Medium, lastSeen: '2024-07-28T01:15:00Z' },
    { id: 'dev9', userId: 'user7', deviceName: 'FM-DESKTOP-02', os: 'Windows 10', healthStatus: HealthStatus.Healthy, riskLevel: RiskLevel.Low, lastSeen: '2024-07-26T18:00:00Z' },
    
    // Additional data for richer charts
    { id: 'dev10', userId: 'user1', deviceName: 'AV-TABLET-01', os: 'Android 14', healthStatus: HealthStatus.Healthy, riskLevel: RiskLevel.Low, lastSeen: '2024-07-28T11:00:00Z' },
    { id: 'dev11', userId: 'user2', deviceName: 'AW-PHONE-01', os: 'Android 14', healthStatus: HealthStatus.AtRisk, riskLevel: RiskLevel.Medium, lastSeen: '2024-07-27T20:00:00Z' },
    { id: 'dev12', userId: 'user3', deviceName: 'BP-PHONE-01', os: 'iOS 17.5', healthStatus: HealthStatus.Healthy, riskLevel: RiskLevel.Low, lastSeen: '2024-07-28T09:30:00Z' },
    { id: 'dev13', userId: 'user4', deviceName: 'CW-LAPTOP-02', os: 'macOS Sonoma', healthStatus: HealthStatus.AtRisk, riskLevel: RiskLevel.High, lastSeen: '2024-07-25T10:20:00Z' },
    { id: 'dev14', userId: 'user5', deviceName: 'DS-LAPTOP-01', os: 'Ubuntu 22.04', healthStatus: HealthStatus.Healthy, riskLevel: RiskLevel.Low, lastSeen: '2024-07-28T14:00:00Z' },
    { id: 'dev15', userId: 'user6', deviceName: 'EJ-DESKTOP-01', os: 'Windows 11', healthStatus: HealthStatus.Inactive, riskLevel: RiskLevel.Unknown, lastSeen: '2024-07-20T16:00:00Z' },
    { id: 'dev16', userId: 'user7', deviceName: 'FM-SERVER-01', os: 'Windows Server 2022', healthStatus: HealthStatus.AtRisk, riskLevel: RiskLevel.High, lastSeen: '2024-07-28T05:00:00Z' },
];


// Add photo URLs using a placeholder service
const usersWithPhotos = mockUsers.map(user => ({
    ...user,
    photoUrl: `https://i.pravatar.cc/150?u=${user.mail}`
}));

export const login = (role: UserRole): Promise<User | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const user = usersWithPhotos.find(u => u.role === role);
            resolve(user);
        }, 100);
    });
};

export const getUsers = (): Promise<User[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(usersWithPhotos);
        }, 500);
    });
};

export const getAllDevices = (): Promise<Device[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockDevices);
        }, 800);
    });
};

export const getDevicesForUser = (userId: string): Promise<Device[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockDevices.filter(d => d.userId === userId));
        }, 300);
    });
};