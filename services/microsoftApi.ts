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
    console.log('🔄 Fetching users from backend API...');
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            console.log('⏰ Request timed out after 30 seconds');
        }, 30000); // 30 second timeout
        
        const response = await fetch('http://localhost:3001/api/users', {
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
            throw new Error(errorData.error || `Backend returned ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Users fetched successfully:', data.length, 'users');
        return data;
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out - Backend server may not be running on port 3001');
        }
        throw new Error(`Connection failed: ${error.message}`);
    }
};

export const getAllDevices = async (): Promise<Device[]> => {
    console.log('🔄 Fetching devices from backend API...');
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            console.log('⏰ Request timed out after 30 seconds');
        }, 30000); // 30 second timeout
        
        const response = await fetch('http://localhost:3001/api/devices', {
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
            throw new Error(errorData.error || `Backend returned ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Devices fetched successfully:', data.length, 'devices');
        return data;
    } catch (error: any) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out - Backend server may not be running on port 3001');
        }
        throw new Error(`Connection failed: ${error.message}`);
    }
};
