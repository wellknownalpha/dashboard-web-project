import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { AuthUser, UserRole } from '../types';
import UserAvatar from './UserAvatar';
import SessionManager from './SessionManager';

interface UserManagementProps {
    currentUser: AuthUser;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
    const [users, setUsers] = useState<AuthUser[]>([]);
    const [showAddUser, setShowAddUser] = useState(false);
    const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
    const [newUser, setNewUser] = useState({
        username: '',
        displayName: '',
        email: '',
        role: UserRole.Viewer,
        password: ''
    });
    const [editUser, setEditUser] = useState({
        username: '',
        displayName: '',
        email: '',
        role: UserRole.Viewer
    });
    const [generatedCredentials, setGeneratedCredentials] = useState<{username: string; password: string} | null>(null);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [mfaSetup, setMfaSetup] = useState<{userId: string; secret: string; qrCodeUrl: string} | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>('All');

    const handleEnableMFA = async (userId: string) => {
        try {
            const result = await authService.enableMFA(userId);
            setMfaSetup({ userId, ...result });
            setUsers(authService.getAllUsers());
            setSuccess('MFA enabled. Scan the QR code with your authenticator app.');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDisableMFA = async (userId: string) => {
        if (window.confirm('Are you sure you want to disable MFA for this user?')) {
            await authService.disableMFA(userId);
            setUsers(authService.getAllUsers());
            setSuccess('MFA disabled successfully');
        }
    };

    useEffect(() => {
        setUsers(authService.getAllUsers());
    }, []);

    const clearMessages = () => {
        setError('');
        setSuccess('');
    };

    const handleAddUser = async () => {
        clearMessages();
        if (!newUser.username || !newUser.displayName || !newUser.email) {
            setError('All fields are required');
            return;
        }

        try {
            const password = newUser.password || authService.generateSecurePassword();
            const result = await authService.createUser({
                username: newUser.username,
                displayName: newUser.displayName,
                email: newUser.email,
                role: newUser.role
            }, password);
            
            setUsers(authService.getAllUsers());
            setGeneratedCredentials({ username: result.user.username, password: result.password });
            setNewUser({ username: '', displayName: '', email: '', role: UserRole.Viewer, password: '' });
            setShowAddUser(false);
            setSuccess('User created successfully');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEditUser = (user: AuthUser) => {
        setEditingUser(user);
        setEditUser({
            username: user.username,
            displayName: user.displayName,
            email: user.email,
            role: user.role
        });
        clearMessages();
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        clearMessages();

        try {
            const updatedUser = await authService.updateUser(editingUser.id, editUser);
            if (updatedUser) {
                setUsers(authService.getAllUsers());
                setEditingUser(null);
                setSuccess('User updated successfully');
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleResetPassword = async (userId: string) => {
        clearMessages();
        try {
            const newPassword = await authService.resetPassword(userId);
            setGeneratedCredentials({ 
                username: users.find(u => u.id === userId)?.username || '', 
                password: newPassword 
            });
            setSuccess('Password reset successfully');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (userId === currentUser.id) {
            setError('Cannot delete your own account');
            return;
        }
        
        clearMessages();
        if (window.confirm('Are you sure you want to delete this user?')) {
            await authService.deleteUser(userId);
            setUsers(authService.getAllUsers());
            setSuccess('User deleted successfully');
        }
    };

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case UserRole.GlobalAdmin: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case UserRole.Admin: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case UserRole.Viewer: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (currentUser.role !== UserRole.GlobalAdmin) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center py-8">
                    <div className="text-6xl mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
                    <p className="text-gray-500 dark:text-gray-400">Global Admin privileges required to access user management.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage user accounts, roles, and security settings</p>
                    </div>
                    <button
                        onClick={() => { setShowAddUser(true); clearMessages(); }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
                    >
                        <span className="text-lg"></span>
                        Add User
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search users by name, email, or username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'All')}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="All">All Roles</option>
                            <option value={UserRole.GlobalAdmin}>Global Admin</option>
                            <option value={UserRole.Admin}>Admin</option>
                            <option value={UserRole.Viewer}>Viewer</option>
                        </select>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
                        <span className="text-red-500 text-xl"></span>
                        <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
                        <span className="text-green-500 text-xl"></span>
                        <p className="text-green-800 dark:text-green-200">{success}</p>
                    </div>
                )}

                {generatedCredentials && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-blue-500 text-xl"></span>
                            <h3 className="font-semibold text-blue-800 dark:text-blue-200">Login Credentials Generated</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-blue-700 dark:text-blue-300">Username</label>
                                <code className="block bg-blue-100 dark:bg-blue-800 px-3 py-2 rounded mt-1 font-mono text-sm">{generatedCredentials.username}</code>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-blue-700 dark:text-blue-300">Password</label>
                                <code className="block bg-blue-100 dark:bg-blue-800 px-3 py-2 rounded mt-1 font-mono text-sm">{generatedCredentials.password}</code>
                            </div>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">Save these credentials securely - they won't be shown again.</p>
                        <button
                            onClick={() => setGeneratedCredentials(null)}
                            className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Add User Form */}
                {showAddUser && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Add New User</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                                <input
                                    type="text"
                                    placeholder="Enter username"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    value={newUser.displayName}
                                    onChange={(e) => setNewUser({...newUser, displayName: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    placeholder="Enter email address"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={UserRole.Viewer}>Viewer</option>
                                    <option value={UserRole.Admin}>Admin</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password (Optional)</label>
                                <input
                                    type="password"
                                    placeholder="Leave empty to auto-generate secure password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Password must be 8+ characters with uppercase, lowercase, number, and special character
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleAddUser}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create User
                            </button>
                            <button
                                onClick={() => setShowAddUser(false)}
                                className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Edit User Form */}
                {editingUser && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Edit User</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
                                <input
                                    type="text"
                                    value={editUser.username}
                                    onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={editUser.displayName}
                                    onChange={(e) => setEditUser({...editUser, displayName: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={editUser.email}
                                    onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                                <select
                                    value={editUser.role}
                                    onChange={(e) => setEditUser({...editUser, role: e.target.value as UserRole})}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={UserRole.Viewer}>Viewer</option>
                                    <option value={UserRole.Admin}>Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleUpdateUser}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Update User
                            </button>
                            <button
                                onClick={() => setEditingUser(null)}
                                className="px-6 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* MFA Setup Modal */}
                {mfaSetup && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">MFA Setup</h3>
                        <div className="text-center">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">Scan this QR code with Google Authenticator</p>
                            <img src={mfaSetup.qrCodeUrl} alt="QR Code" className="mx-auto mb-4 border rounded-lg" />
                            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Manual Entry Code:</p>
                                <code className="text-sm font-mono text-gray-800 dark:text-gray-200">{mfaSetup.secret}</code>
                            </div>
                        </div>
                        <button
                            onClick={() => setMfaSetup(null)}
                            className="mt-6 w-full px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}

                {/* Session Manager */}
                <SessionManager />

                {/* Users List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Users ({filteredUsers.length})
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredUsers.map((user) => {
                            const userMFA = authService.isMFAEnabled(user.id);
                            return (
                                <div key={user.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <UserAvatar user={{ displayName: user.displayName, photoUrl: null }} />
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white">{user.displayName}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500">@{user.username}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    userMFA 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                    MFA: {userMFA ? 'ON' : 'OFF'}
                                                </span>
                                                {userMFA ? (
                                                    <button
                                                        onClick={() => handleDisableMFA(user.id)}
                                                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                                                    >
                                                        Disable MFA
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEnableMFA(user.id)}
                                                        className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-sm font-medium"
                                                    >
                                                        Enable MFA
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleResetPassword(user.id)}
                                                    className="px-3 py-1 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors"
                                                >
                                                    Reset Password
                                                </button>
                                                {user.id !== currentUser.id && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredUsers.length === 0 && (
                            <div className="p-12 text-center">
                                <div className="text-4xl mb-4"></div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
                                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
