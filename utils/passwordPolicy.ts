export interface PasswordPolicy {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    specialChars: string;
}

export const defaultPasswordPolicy: PasswordPolicy = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

export const validatePassword = (password: string, policy: PasswordPolicy = defaultPasswordPolicy): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < policy.minLength) {
        errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (policy.requireSpecialChars && !new RegExp(`[${policy.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const generateSecurePassword = (length: number = 12): string => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = 4; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
};