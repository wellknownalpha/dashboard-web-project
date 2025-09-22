import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface UserSession {
    sessionId: string;
    userId: string;
    username: string;
    loginTime: string;
    lastActivity: string;
}

const SessionManager: React.FC = () => {
    const [sessions, setSessions] = useState<UserSession[]>([]);

    useEffect(() => {
        loadSessions();
        const interval = setInterval(loadSessions, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const loadSessions = () => {
        authService.cleanupSessions();
        setSessions(authService.getAllActiveSessions());
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleString();
    };

    const getTimeAgo = (isoString: string) => {
        const diff = Date.now() - new Date(isoString).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Active Sessions ({sessions.length})
                </h3>
                <button
                    onClick={loadSessions}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Refresh
                </button>
            </div>
            
            {sessions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No active sessions
                </p>
            ) : (
                <div className="space-y-3">
                    {sessions.map((session) => (
                        <div key={session.sessionId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {session.username}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Session ID: {session.sessionId}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                        Login: {formatTime(session.loginTime)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full">
                                        Active
                                    </span>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        Last seen: {getTimeAgo(session.lastActivity)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SessionManager;