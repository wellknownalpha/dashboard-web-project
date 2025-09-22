import { AuthUser, UserRole } from '../types';
import { validatePassword, generateSecurePassword } from '../utils/passwordPolicy';
import { TOTPService } from './totpService';
import bcrypt from 'bcryptjs';

interface StoredUser extends AuthUser {
    passwordHash: string;
}

interface UserSession {
    sessionId: string;
    userId: string;
    username: string;
    loginTime: string;
    lastActivity: string;
}

interface DatabaseData {
    users: StoredUser[];
    sessions: UserSession[];
}

class BrowserDatabase {
    private readonly DB_KEY = 'secureops_users_db';

    private readDatabase(): DatabaseData {
        try {
            const data = localStorage.getItem(this.DB_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                // Ensure sessions array exists
                if (!parsed.sessions) {
                    parsed.sessions = [];
                }
                return parsed;
            }
        } catch (error) {
            console.error('Error reading database:', error);
        }
        return this.initializeDatabase();
    }

    private writeDatabase(data: DatabaseData): void {
        try {
            localStorage.setItem(this.DB_KEY, JSON.stringify(data));
            console.log('Database written successfully');
        } catch (error) {
            console.error('Error writing database:', error);
            throw error;
        }
    }

    private initializeDatabase(): DatabaseData {
        console.log('Initializing database with default user');
        const defaultData: DatabaseData = {
            users: [
                {
                    id: '1',
                    username: 'globaladmin',
                    displayName: 'Global Administrator',
                    email: 'admin@company.com',
                    role: UserRole.GlobalAdmin,
                    passwordHash: 'Admin@123', // Your custom password
                    createdAt: new Date().toISOString(),
                    mfaEnabled: false,
                    mfaSecret: undefined
                }
            ],
            sessions: []
        };
        this.writeDatabase(defaultData);
        return defaultData;
    }

    async createUser(userData: Omit<AuthUser, 'id' | 'createdAt' | 'mfaEnabled' | 'mfaSecret'>, password: string): Promise<AuthUser> {
        const data = this.readDatabase();
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser: StoredUser = {
            ...userData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            passwordHash: hashedPassword,
            mfaEnabled: false,
            mfaSecret: undefined
        };
        
        data.users.push(newUser);
        this.writeDatabase(data);
        
        const { passwordHash, ...authUser } = newUser;
        return authUser;
    }

    async authenticateUser(username: string, password: string): Promise<{ user: AuthUser; sessionId: string } | null> {
        console.log('Authenticating user:', username, 'with password:', password);
        const data = this.readDatabase();
        console.log('Available users:', data.users.map(u => ({ username: u.username, passwordHash: u.passwordHash })));
        
        const user = data.users.find(u => u.username === username);
        if (!user) {
            console.log('User not found');
            return null;
        }
        
        let isValidPassword = false;
        
        // Try simple password comparison first
        if (user.passwordHash === password) {
            isValidPassword = true;
            console.log('Simple password match');
        } else {
            // Try bcrypt if it looks like a hash
            try {
                if (user.passwordHash.startsWith('$2')) {
                    isValidPassword = await bcrypt.compare(password, user.passwordHash);
                    console.log('Bcrypt password match:', isValidPassword);
                }
            } catch (error) {
                console.log('Bcrypt error:', error);
            }
        }
        
        if (!isValidPassword) {
            console.log('Password validation failed');
            return null;
        }
        
        // Create new session
        const sessionId = this.generateSessionId();
        const now = new Date().toISOString();
        
        const newSession: UserSession = {
            sessionId,
            userId: user.id,
            username: user.username,
            loginTime: now,
            lastActivity: now
        };
        
        data.sessions.push(newSession);
        user.lastLogin = now;
        this.writeDatabase(data);
        
        const { passwordHash, ...authUser } = user;
        console.log('Login successful for user:', authUser.username);
        return { user: authUser, sessionId };
    }

    private generateSessionId(): string {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    validateSession(sessionId: string): AuthUser | null {
        const data = this.readDatabase();
        const session = data.sessions.find(s => s.sessionId === sessionId);
        
        if (!session) return null;
        
        // Update last activity
        session.lastActivity = new Date().toISOString();
        this.writeDatabase(data);
        
        const user = data.users.find(u => u.id === session.userId);
        if (!user) return null;
        
        const { passwordHash, ...authUser } = user;
        return authUser;
    }

    endSession(sessionId: string): boolean {
        const data = this.readDatabase();
        const initialLength = data.sessions.length;
        data.sessions = data.sessions.filter(s => s.sessionId !== sessionId);
        
        if (data.sessions.length < initialLength) {
            this.writeDatabase(data);
            return true;
        }
        return false;
    }

    getAllActiveSessions(): UserSession[] {
        const data = this.readDatabase();
        return data.sessions;
    }

    cleanupExpiredSessions(maxAgeHours: number = 24): void {
        const data = this.readDatabase();
        const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();
        
        const initialLength = data.sessions.length;
        data.sessions = data.sessions.filter(s => s.lastActivity > cutoffTime);
        
        if (data.sessions.length < initialLength) {
            this.writeDatabase(data);
        }
    }

    getAllUsers(): AuthUser[] {
        const data = this.readDatabase();
        return data.users.map(({ passwordHash, ...user }) => user);
    }

    async updateUser(userId: string, updates: Partial<Omit<AuthUser, 'id' | 'createdAt'>>): Promise<AuthUser | null> {
        const data = this.readDatabase();
        const userIndex = data.users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) return null;
        
        data.users[userIndex] = { ...data.users[userIndex], ...updates };
        this.writeDatabase(data);
        
        const { passwordHash, ...authUser } = data.users[userIndex];
        return authUser;
    }

    async changePassword(userId: string, newPassword: string): Promise<boolean> {
        const data = this.readDatabase();
        const userIndex = data.users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) return false;
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        data.users[userIndex].passwordHash = hashedPassword;
        this.writeDatabase(data);
        
        return true;
    }

    deleteUser(userId: string): boolean {
        const data = this.readDatabase();
        const initialLength = data.users.length;
        data.users = data.users.filter(u => u.id !== userId);
        
        if (data.users.length < initialLength) {
            this.writeDatabase(data);
            return true;
        }
        return false;
    }

    async enableMFA(userId: string, secret: string): Promise<boolean> {
        const data = this.readDatabase();
        const userIndex = data.users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) return false;
        
        data.users[userIndex].mfaEnabled = true;
        data.users[userIndex].mfaSecret = secret;
        this.writeDatabase(data);
        
        return true;
    }

    async disableMFA(userId: string): Promise<boolean> {
        const data = this.readDatabase();
        const userIndex = data.users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) return false;
        
        data.users[userIndex].mfaEnabled = false;
        data.users[userIndex].mfaSecret = undefined;
        this.writeDatabase(data);
        
        return true;
    }

    getMFASecret(userId: string): string | null {
        const data = this.readDatabase();
        const user = data.users.find(u => u.id === userId);
        return user?.mfaSecret || null;
    }

    isMFAEnabled(userId: string): boolean {
        const data = this.readDatabase();
        const user = data.users.find(u => u.id === userId);
        return user?.mfaEnabled || false;
    }
}

const browserDatabase = new BrowserDatabase();

// Expose for debugging
if (typeof window !== 'undefined') {
    (window as any).authService = {
        resetDatabase: () => {
            localStorage.removeItem('secureops_users_db');
            localStorage.removeItem('sessionId');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('mfaVerified');
            console.log('Database reset - please refresh page');
        },
        checkDatabase: () => {
            const data = localStorage.getItem('secureops_users_db');
            console.log('Database contents:', JSON.parse(data || '{}'));
        }
    };
}

export const authService = {
    // Debug function to reset database
    resetDatabase: () => {
        localStorage.removeItem('secureops_users_db');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('mfaVerified');
        console.log('Database reset - please refresh page');
    },
    login: async (username: string, password: string): Promise<AuthUser | null> => {
        const result = await browserDatabase.authenticateUser(username, password);
        if (result) {
            // Store session info
            localStorage.setItem('sessionId', result.sessionId);
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            return result.user;
        }
        return null;
    },

    completeLogin: (user: AuthUser) => {
        // Session is already handled in login method
    },

    logout: () => {
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
            browserDatabase.endSession(sessionId);
        }
        localStorage.removeItem('sessionId');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('mfaVerified');
    },

    getCurrentUser: (): AuthUser | null => {
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) return null;
        
        const user = browserDatabase.validateSession(sessionId);
        if (!user) {
            // Invalid session, clear storage
            localStorage.removeItem('sessionId');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('mfaVerified');
            return null;
        }
        
        // Check MFA if enabled
        if (browserDatabase.isMFAEnabled(user.id)) {
            const mfaVerified = localStorage.getItem('mfaVerified');
            if (!mfaVerified) {
                return null;
            }
        }
        
        return user;
    },

    getAllActiveSessions: () => {
        return browserDatabase.getAllActiveSessions();
    },

    cleanupSessions: () => {
        browserDatabase.cleanupExpiredSessions();
    },

    createUser: async (userData: Omit<AuthUser, 'id' | 'createdAt' | 'mfaEnabled' | 'mfaSecret'>, password: string): Promise<{ user: AuthUser; password: string }> => {
        const validation = validatePassword(password);
        if (!validation.isValid) {
            throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
        }

        const user = await browserDatabase.createUser(userData, password);
        return { user, password };
    },

    updateUser: async (userId: string, updates: Partial<Omit<AuthUser, 'id' | 'createdAt'>>): Promise<AuthUser | null> => {
        const updatedUser = await browserDatabase.updateUser(userId, updates);
        
        // Update current user session if it's the same user
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId && updatedUser) {
            const currentUser = browserDatabase.validateSession(sessionId);
            if (currentUser && currentUser.id === userId) {
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            }
        }
        
        return updatedUser;
    },

    changePassword: async (userId: string, newPassword: string): Promise<boolean> => {
        const validation = validatePassword(newPassword);
        if (!validation.isValid) {
            throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
        }

        return await browserDatabase.changePassword(userId, newPassword);
    },

    resetPassword: async (userId: string): Promise<string> => {
        const newPassword = generateSecurePassword();
        const success = await browserDatabase.changePassword(userId, newPassword);
        if (!success) throw new Error('User not found');
        return newPassword;
    },

    getAllUsers: (): AuthUser[] => {
        return browserDatabase.getAllUsers();
    },

    deleteUser: async (userId: string): Promise<boolean> => {
        return browserDatabase.deleteUser(userId);
    },

    generateSecurePassword: (): string => {
        return generateSecurePassword();
    },

    validatePassword: (password: string) => {
        return validatePassword(password);
    },

    // MFA Management
    enableMFA: async (userId: string): Promise<{ secret: string; qrCodeUrl: string }> => {
        const users = browserDatabase.getAllUsers();
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');

        const secret = TOTPService.generateSecret();
        const qrCodeUrl = await TOTPService.generateQRCodeURL(secret, user.email);

        await browserDatabase.enableMFA(userId, secret);

        return { secret, qrCodeUrl };
    },

    disableMFA: async (userId: string): Promise<boolean> => {
        return await browserDatabase.disableMFA(userId);
    },

    verifyTOTP: async (userId: string, token: string): Promise<boolean> => {
        if (!browserDatabase.isMFAEnabled(userId)) return false;
        
        const secret = browserDatabase.getMFASecret(userId);
        if (!secret) return false;

        return TOTPService.verifyTOTP(secret, token);
    },

    isMFAEnabled: (userId: string): boolean => {
        return browserDatabase.isMFAEnabled(userId);
    }
};