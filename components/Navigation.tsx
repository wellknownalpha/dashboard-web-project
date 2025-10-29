import React from 'react';
import { UserRole } from '../types';
import ThemeToggle from './ThemeToggle';


interface NavigationProps {
    currentPage: 'dashboard' | 'devices' | 'users' | 'compliance';
    onNavigate: (page: 'dashboard' | 'devices' | 'users' | 'compliance') => void;
    currentUser: { displayName: string; role: UserRole };
    onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
    currentPage, 
    onNavigate, 
    currentUser, 
    onLogout
}) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '' },
        { id: 'devices', label: 'Devices', icon: '' },
        { id: 'compliance', label: 'Compliance', icon: '' },
        ...(currentUser.role === UserRole.GlobalAdmin ? [{ id: 'users', label: 'Users', icon: '' }] : [])
    ];

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-2">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white"> SecureOps</h1>
                        </div>
                        
                        <div className="flex space-x-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate(item.id as any)}
                                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                        currentPage === item.id
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">

                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Welcome, {currentUser.displayName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">  {currentUser.role}</p>
                        </div>
                        
                        <ThemeToggle />
                        
                        <button
                            onClick={onLogout}
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <span className="text-lg">→</span>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
