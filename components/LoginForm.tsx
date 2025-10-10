import React, { useState } from 'react';
import { authService } from '../services/authService';
import { AuthUser } from '../types';

interface LoginFormProps {
    onLogin: (user: AuthUser) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        console.log('Login form submitted:', { username, password });

        try {
            const user = await authService.login(username, password);
            console.log('Login result:', user);
            if (user) {
                onLogin(user);
            } else {
                setError('Invalid username or password');
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(`Login failed: ${err.message || 'Please try again.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div>
                    <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white">
                        SecureOps Login
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Microsoft 365 & Defender Dashboard
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username" className="sr-only">Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Username"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Password"
                        />
                    </div>

                    {error && (
                        <div className="text-red-600 dark:text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-2">
		    {/* <p>Default credentials:</p>
                        <p>Username: <code>globaladmin</code> | Password: <code>Admin@123</code></p>
                     */}   <button
                            type="button"
                            onClick={() => {
                                // @ts-ignore
                                window.authService?.resetDatabase();
                                alert('Database reset! Please refresh the page.');
                            }}
                            className="text-xs text-red-500 hover:text-red-700 underline"
                        >
                            Reset Database (Debug)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
