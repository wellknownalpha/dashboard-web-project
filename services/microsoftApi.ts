import { User, Device, UserRole } from '../types';

export const login = async (role: UserRole): Promise<User | undefined> => {
    return Promise.resolve({
        id: 'realuser',
        displayName: 'Authenticated User',
        mail: 'user@contoso.com',
        jobTitle: 'Engineer',
        department: 'IT',
        role: role,
        photoUrl: 'https://i.pravatar.cc/150?u=user@contoso.com'
    });
};

export const getUsers = async (): Promise<User[]> => {
    try {
        console.log('🔄 Fetching users from:', 'http://localhost:3001/api/users');
        const response = await fetch('http://localhost:3001/api/users');
        console.log('📡 User API response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('❌ User API Error:', errorData);
            throw new Error(errorData.error || 'Failed to fetch users from Microsoft Graph');
        }
        
        const data = await response.json();
        console.log('✅ Users fetched successfully:', data.length, 'users');
        return data;
    } catch (error) {
        console.error('❌ Failed to fetch users:', error);
        return []; // Keep returning empty array for users to prevent app crash
    }
};

export const getAllDevices = async (): Promise<Device[]> => {
    try {
        console.log('🔄 Fetching devices from:', 'http://localhost:3001/api/devices');
        const response = await fetch('http://localhost:3001/api/devices');
        console.log('📡 Device API response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('❌ Device API Error:', errorData);
            throw new Error(errorData.error || 'Failed to fetch devices from Microsoft Defender');
        }
        
        const data = await response.json();
        console.log('✅ Devices fetched successfully:', data.length, 'devices');
        return data;
    } catch (error) {
        console.error('❌ Failed to fetch devices:', error);
        throw error; // Throw the error so Dashboard can show it
    }
};
