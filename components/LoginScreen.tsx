import React from 'react';
import { MicrosoftIcon } from './icons';
import { UserRole } from '../types';

interface LoginScreenProps {
    onLogin: (role: UserRole) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SecureOps Command Center</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">O365 & Microsoft Defender</p>
                </div>
                <div className="space-y-4">
                    <button
                        onClick={() => onLogin(UserRole.Admin)}
                        className="w-full flex items-center justify-center px-4 py-3 font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300"
                    >
                        <MicrosoftIcon className="w-5 h-5 mr-3" />
                        Login as Admin
                    </button>
                    <button
                        onClick={() => onLogin(UserRole.Viewer)}
                        className="w-full flex items-center justify-center px-4 py-3 font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300"
                    >
                        <MicrosoftIcon className="w-5 h-5 mr-3" />
                        Login as Viewer
                    </button>
                </div>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    This is a simulated process to demonstrate role-based access.
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;