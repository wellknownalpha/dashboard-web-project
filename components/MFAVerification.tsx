import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface MFAVerificationProps {
    userId: string;
    onVerified: () => void;
    onCancel: () => void;
}

const MFAVerification: React.FC<MFAVerificationProps> = ({ userId, onVerified, onCancel }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                const newTime = 30 - (Math.floor(Date.now() / 1000) % 30);
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleVerify = () => {
        setError('');
        
        if (authService.verifyTOTP(userId, code)) {
            onVerified();
        } else {
            setError('Invalid code. Please try again.');
        }
    };

    const formatTime = (seconds: number) => {
        return `${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Two-Factor Authentication
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Enter the 6-digit code from your authenticator app
                    </p>
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            📱 Use Google Authenticator or similar TOTP app
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <input
                            type="text"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {error && (
                        <div className="text-red-600 dark:text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                        New code in: <span className="font-mono">{formatTime(timeLeft)}s</span>
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={handleVerify}
                            disabled={code.length !== 6 || timeLeft === 0}
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Verify Code
                        </button>

                        <button
                            onClick={onCancel}
                            className="w-full py-2 px-4 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MFAVerification;