export enum RiskLevel {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Unknown = 'Unknown'
}

export enum HealthStatus {
    Healthy = 'Healthy',
    Inactive = 'Inactive',
    AtRisk = 'At risk'
}

export enum UserRole {
    Admin = 'Admin',
    Viewer = 'Viewer',
}

export interface User {
    id: string;
    displayName: string;
    mail: string;
    jobTitle: string;
    department: string;
    role: UserRole;
    photoUrl?: string;
}

export interface Device {
    id: string;
    userId: string;
    deviceName: string;
    os: string;
    healthStatus: HealthStatus;
    riskLevel: RiskLevel;
    lastSeen: string;
}

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}