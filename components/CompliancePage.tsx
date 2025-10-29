// React imports for component functionality
import React, { useState, useEffect, useMemo } from 'react';

// Microsoft API services for data fetching
import { getUsers, getAllDevices } from '../services/microsoftApi';
import { mapDevicesToUsers } from '../services/deviceUserMapping';

// Type definitions for type safety
import { User, Device, RiskLevel, UserRole } from '../types';

// Utility for compliance report generation
import { exportComplianceReport } from '../utils/complianceExport';
import { EmailAlertServices } from '../services/emailAlertService';
import { IndividualEmailService } from '../services/individualEmailService';

/**
 * Interface defining compliance statistics structure
 * Used to track and display compliance metrics across the organization
 */
interface ComplianceStats {
    totalUsers: number;                                           // Total licensed users in scope
    compliantUsers: number;                                       // Users with active Defender devices
    nonCompliantUsers: number;                                    // Users without Defender protection
    complianceRate: number;                                       // Percentage of compliant users
    highRiskDevices: number;                                      // Count of high-risk devices
    unprotectedUsers: User[];                                     // Detailed list of non-compliant users
    protectedUsers: { user: User; devices: Device[] }[];         // Users with their associated devices
}

/**
 * Compliance Dashboard Page Component
 * Provides comprehensive view of organizational compliance with Microsoft Defender
 * 
 * Key Features:
 * - Real-time compliance statistics
 * - Visual compliance status indicators
 * - Detailed lists of compliant and non-compliant users
 * - Export functionality for compliance reports
 * - Color-coded compliance levels (Excellent >90%, Good >70%, Poor <70%)
 */
const CompliancePage: React.FC = () => {
    // Component state management
    const [users, setUsers] = useState<User[]>([]);              // Microsoft Graph API users
    const [devices, setDevices] = useState<Device[]>([]);        // Microsoft Defender devices
    const [loading, setLoading] = useState(true);                // Loading state for API calls
    const [error, setError] = useState<string | null>(null);     // Error state for API failures
    const [sendingAlerts, setSendingAlerts] = useState(false);   // Email alert sending state
    const [alertResult, setAlertResult] = useState<string | null>(null); // Alert result message
    const [sendingIndividual, setSendingIndividual] = useState<Set<string>>(new Set()); // Individual email sending state

    // Fetch compliance data on component mount
    useEffect(() => {
        /**
         * Fetch users and devices data for compliance analysis
         * Performs parallel API calls for better performance
         */
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Parallel API calls to Microsoft Graph and Defender APIs
                const [userResponse, deviceResponse] = await Promise.all([getUsers(), getAllDevices()]);
                
                // Map devices to users using various identification strategies
                const mappedDevices = mapDevicesToUsers(userResponse, deviceResponse);
                
                // Update component state with fetched data
                setUsers(userResponse);
                setDevices(mappedDevices);
            } catch (error: any) {
                setError(error.message || 'Failed to fetch compliance data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    /**
     * Calculate comprehensive compliance statistics
     * Memoized for performance optimization
     * 
     * Compliance Logic:
     * - Only considers users with Defender licenses (appear in both users and devices data)
     * - Users are compliant if they have at least one registered Defender device
     * - Compliance rate = (compliant users / total licensed users) * 100
     */
    const complianceStats: ComplianceStats = useMemo(() => {
        const userDeviceMap = new Map<string, Device[]>();
        
        // Create mapping of users to their associated devices
        devices.forEach(device => {
            if (!userDeviceMap.has(device.userId)) {
                userDeviceMap.set(device.userId, []);
            }
            userDeviceMap.get(device.userId)!.push(device);
        });

        // Identify licensed users (those who appear in both users and devices datasets)
        // This ensures we only evaluate users who should have Defender protection
        const licensedUserIds = new Set([...users.map(u => u.id), ...devices.map(d => d.userId)]);
        const licensedUsers = users.filter(user => licensedUserIds.has(user.id));

        // Categorize users based on device protection status
        const protectedUsers: { user: User; devices: Device[] }[] = [];
        const unprotectedUsers: User[] = [];

        licensedUsers.forEach(user => {
            const userDevices = userDeviceMap.get(user.id) || [];
            if (userDevices.length > 0) {
                // User has registered Defender devices - compliant
                protectedUsers.push({ user, devices: userDevices });
            } else {
                // User has no registered Defender devices - non-compliant
                unprotectedUsers.push(user);
            }
        });

        // Calculate additional metrics
        const highRiskDevices = devices.filter(d => d.riskLevel === RiskLevel.High).length;
        const complianceRate = licensedUsers.length > 0 ? (protectedUsers.length / licensedUsers.length) * 100 : 0;

        return {
            totalUsers: licensedUsers.length,
            compliantUsers: protectedUsers.length,
            nonCompliantUsers: unprotectedUsers.length,
            complianceRate,
            highRiskDevices,
            unprotectedUsers,
            protectedUsers
        };
    }, [users, devices]);

    /**
     * Determine text color based on compliance rate
     * @param {number} rate - Compliance rate percentage (0-100)
     * @returns {string} Tailwind CSS color classes
     */
    const getComplianceColor = (rate: number) => {
        if (rate >= 90) return 'text-green-600 dark:text-green-400';   // Excellent compliance
        if (rate >= 70) return 'text-yellow-600 dark:text-yellow-400'; // Good compliance
        return 'text-red-600 dark:text-red-400';                       // Poor compliance
    };

    /**
     * Determine background color and border styling based on compliance rate
     * @param {number} rate - Compliance rate percentage (0-100)
     * @returns {string} Tailwind CSS background and border classes
     */
    const getComplianceBg = (rate: number) => {
        if (rate >= 90) return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800';
        if (rate >= 70) return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
        return 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    };

    // Loading state display
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading compliance data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="p-6 space-y-6">
                {/* Page Header with Title and Export Button */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Compliance Dashboard</h2>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor compliance for users with Microsoft Defender licenses</p>
                    </div>
                    <div className="flex gap-3">
                        {/* Send Email Alerts Button */}
                        <button
                            onClick={async () => {
                                setSendingAlerts(true);
                                setAlertResult(null);
                                try {
                                    const result = await EmailAlertService.sendComplianceAlerts(users, devices);
                                    if (result.success) {
                                        setAlertResult(`✅ Successfully sent ${result.alertsSent} compliance alerts`);
                                    } else {
                                        setAlertResult(`⚠️ Sent ${result.alertsSent} alerts with ${result.errors.length} errors`);
                                    }
                                } catch (error) {
                                    setAlertResult('❌ Failed to send compliance alerts');
                                } finally {
                                    setSendingAlerts(false);
                                }
                            }}
                            disabled={sendingAlerts}
                            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-orange-400 transition-colors flex items-center gap-2 shadow-md"
                        >
                            <span className="text-lg">{sendingAlerts ? '' : ''}</span>
                            {sendingAlerts ? 'Sending Alerts...' : 'Send Email Alerts'}
                        </button>
                        
                        {/* Export Compliance Report Button */}
                        <button
                            onClick={() => exportComplianceReport(users, devices)}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-md"
                        >
                            <span className="text-lg"></span>
                            Export Report
                        </button>
                    </div>
                </div>

                {/* Error Display for API Connection Issues */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <span className="text-red-500 text-xl">⚠️</span>
                            <p className="text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    </div>
                )}

                {/* Alert Result Display */}
                {alertResult && (
                    <div className={`border rounded-lg p-4 ${
                        alertResult.includes('✅') ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                        alertResult.includes('⚠️') ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                        'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                        <div className="flex items-center gap-3">
                            <p className={`${
                                alertResult.includes('✅') ? 'text-green-800 dark:text-green-200' :
                                alertResult.includes('⚠️') ? 'text-yellow-800 dark:text-yellow-200' :
                                'text-red-800 dark:text-red-200'
                            }`}>{alertResult}</p>
                        </div>
                    </div>
                )}

                {/* Compliance Overview - Key Performance Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Licensed Users Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{complianceStats.totalUsers}</p>
                            </div>
                            <div className="text-3xl"></div>
                        </div>
                    </div>

                    {/* Compliant Users Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliant Users</p>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{complianceStats.compliantUsers}</p>
                            </div>
                            <div className="text-3xl"></div>
                        </div>
                    </div>

                    {/* Non-Compliant Users Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Non-Compliant</p>
                                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{complianceStats.nonCompliantUsers}</p>
                            </div>
                            <div className="text-3xl"></div>
                        </div>
                    </div>

                    {/* Compliance Rate Card with Color Coding */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Compliance Rate</p>
                                <p className={`text-3xl font-bold ${getComplianceColor(complianceStats.complianceRate)}`}>
                                    {complianceStats.complianceRate.toFixed(1)}%
                                </p>
                            </div>
                            <div className="text-3xl"></div>
                        </div>
                    </div>
                </div>

                {/* Overall Compliance Status Banner */}
                <div className={`rounded-lg border p-6 ${getComplianceBg(complianceStats.complianceRate)}`}>
                    <div className="flex items-center gap-4">
                        {/* Status Indicator Icon */}
                        <div className="text-4xl">
                            {complianceStats.complianceRate >= 90 ? '' :     // Green circle for excellent
                             complianceStats.complianceRate >= 70 ? '' :     // Yellow circle for good
                             ''                                               /*Red circle for poor */
                             }                                              
                        </div>
                        <div>
                            {/* Dynamic Status Title */}
                            <h3 className={`text-xl font-bold ${getComplianceColor(complianceStats.complianceRate)}`}>
                                {complianceStats.complianceRate >= 90 ? 'Excellent Compliance' :
                                 complianceStats.complianceRate >= 70 ? 'Good Compliance' : 'Poor Compliance'}
                            </h3>
                            {/* Dynamic Status Description */}
                            <p className="text-gray-700 dark:text-gray-300">
                                {complianceStats.complianceRate >= 90 
                                    ? 'Excellent! Most licensed users have active Defender protection.'
                                    : complianceStats.complianceRate >= 70
                                    ? 'Good compliance, but some licensed users need Defender devices.'
                                    : 'Attention needed: Many licensed users lack Defender protection.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Non-Compliant Users Section - Only shown if there are non-compliant users */}
                {complianceStats.unprotectedUsers.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        {/* Section Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl"></span>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Non-Compliant Users ({complianceStats.unprotectedUsers.length})
                                </h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Licensed users without active Defender devices
                            </p>
                        </div>
                        {/* List of Non-Compliant Users */}
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {complianceStats.unprotectedUsers.map((user) => {
                                const userDevices = devices.filter(d => d.userId === user.id);
                                const isLoading = sendingIndividual.has(user.id);
                                
                                return (
                                    <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                                        {/* User Information */}
                                        <div className="flex items-center space-x-4">
                                            {/* User Avatar with Initial */}
                                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                                <span className="text-red-600 dark:text-red-400 font-semibold">
                                                    {user.displayName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            {/* User Details */}
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{user.displayName}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{user.mail}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500">{user.department}</p>
                                            </div>
                                        </div>
                                        {/* Actions and Status */}
                                        <div className="flex items-center space-x-3">
                                            {/* Risk Status Badges */}
                                            <div className="flex items-center space-x-2">
                                                <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-full">
                                                    No Defender
                                                </span>
                                                <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-full">
                                                    High Risk
                                                </span>
                                            </div>
                                            {/* Individual Email Alert Button */}
                                            <button
                                                onClick={async () => {
                                                    setSendingIndividual(prev => new Set(prev).add(user.id));
                                                    try {
                                                        const success = await IndividualEmailService.sendUserAlert(user, userDevices, 15);
                                                        if (success) {
                                                            setAlertResult(`✅ Alert sent to ${user.displayName}`);
                                                        } else {
                                                            setAlertResult(`❌ Failed to send alert to ${user.displayName}`);
                                                        }
                                                    } catch (error) {
                                                        setAlertResult(`❌ Error sending alert to ${user.displayName}`);
                                                    } finally {
                                                        setSendingIndividual(prev => {
                                                            const newSet = new Set(prev);
                                                            newSet.delete(user.id);
                                                            return newSet;
                                                        });
                                                    }
                                                }}
                                                disabled={isLoading}
                                                className="px-3 py-1 text-xs bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-orange-400 transition-colors flex items-center gap-1"
                                                title={`Send email alert to ${user.displayName}`}
                                            >
                                                <span>{isLoading ? '⏳' : ''}</span>
                                                {isLoading ? 'Sending...' : 'Send Alert'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Device Activity Compliance Details */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl"></span>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Device Activity Compliance
                            </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Users with devices active within the last 14 days
                        </p>
                    </div>
                    <div className="p-6">
                        {(() => {
                            const userDeviceMap = new Map<string, Device[]>();
                            const now = new Date();
                            
                            devices.forEach(device => {
                                if (!userDeviceMap.has(device.userId)) {
                                    userDeviceMap.set(device.userId, []);
                                }
                                userDeviceMap.get(device.userId)!.push(device);
                            });

                            const usersWithDevices = users.filter(user => userDeviceMap.has(user.id));
                            const inactiveUsers: { user: User; daysSinceLastSeen: number }[] = [];

                            usersWithDevices.forEach(user => {
                                const userDevices = userDeviceMap.get(user.id) || [];
                                let isActive = false;
                                let oldestLastSeen = now;

                                userDevices.forEach(device => {
                                    if (device.lastSeen) {
                                        const lastSeenDate = new Date(device.lastSeen);
                                        const daysSinceLastSeen = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60 * 24));
                                        
                                        if (daysSinceLastSeen <= 14) {
                                            isActive = true;
                                        }
                                        
                                        if (lastSeenDate < oldestLastSeen) {
                                            oldestLastSeen = lastSeenDate;
                                        }
                                    }
                                });

                                if (!isActive) {
                                    const daysSinceLastSeen = Math.floor((now.getTime() - oldestLastSeen.getTime()) / (1000 * 60 * 60 * 24));
                                    inactiveUsers.push({ user, daysSinceLastSeen });
                                }
                            });

                            const activeUsers = usersWithDevices.length - inactiveUsers.length;
                            const activityRate = usersWithDevices.length > 0 ? (activeUsers / usersWithDevices.length) * 100 : 0;

                            return (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{usersWithDevices.length}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Users with Devices</div>
                                        </div>
                                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeUsers}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Active Users (≤14 days)</div>
                                        </div>
                                        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{inactiveUsers.length}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Inactive Users (&gt;14 days)</div>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Activity Compliance Rate</span>
                                            <span className={`text-lg font-bold ${
                                                activityRate >= 90 ? 'text-green-600 dark:text-green-400' :
                                                activityRate >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                                                'text-red-600 dark:text-red-400'
                                            }`}>
                                                {activityRate.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                            <div 
                                                className={`h-3 rounded-full transition-all duration-500 ${
                                                    activityRate >= 90 ? 'bg-green-500' :
                                                    activityRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                                style={{ width: `${activityRate}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {inactiveUsers.length > 0 && (
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                ⚠️ Users with Inactive Devices ({inactiveUsers.length})
                                            </h4>
                                            <div className="space-y-3">
                                                {inactiveUsers.map(({ user, daysSinceLastSeen }) => {
                                                    const userDevices = devices.filter(d => d.userId === user.id);
                                                    const isLoading = sendingIndividual.has(user.id);
                                                    
                                                    return (
                                                        <div key={user.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                                                                    <span className="text-red-600 dark:text-red-400 font-semibold text-sm">
                                                                        {user.displayName.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900 dark:text-white">{user.displayName}</p>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.mail}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <div className="text-right">
                                                                    <div className="text-sm font-medium text-red-600 dark:text-red-400">
                                                                        {daysSinceLastSeen} days ago
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-500">
                                                                        Last activity
                                                                    </div>
                                                                </div>
                                                                {/* Individual Email Alert Button */}
                                                                <button
                                                                    onClick={async () => {
                                                                        setSendingIndividual(prev => new Set(prev).add(user.id));
                                                                        try {
                                                                            const success = await IndividualEmailService.sendUserAlert(user, userDevices, daysSinceLastSeen);
                                                                            if (success) {
                                                                                setAlertResult(`✅ Alert sent to ${user.displayName}`);
                                                                            } else {
                                                                                setAlertResult(`❌ Failed to send alert to ${user.displayName}`);
                                                                            }
                                                                        } catch (error) {
                                                                            setAlertResult(`❌ Error sending alert to ${user.displayName}`);
                                                                        } finally {
                                                                            setSendingIndividual(prev => {
                                                                                const newSet = new Set(prev);
                                                                                newSet.delete(user.id);
                                                                                return newSet;
                                                                            });
                                                                        }
                                                                    }}
                                                                    disabled={isLoading}
                                                                    className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-orange-400 transition-colors flex items-center gap-1"
                                                                    title={`Send email alert to ${user.displayName}`}
                                                                >
                                                                    <span>{isLoading ? '⏳' : ''}</span>
                                                                    {isLoading ? 'Sending...' : 'Alert'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {inactiveUsers.length === 0 && (
                                        <div className="text-center py-8">
                                            <div className="text-4xl mb-2">✅</div>
                                            <p className="text-lg font-medium text-green-600 dark:text-green-400">
                                                Excellent! All users have active devices
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                All registered devices have been active within the last 14 days
                                            </p>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>

                {/* Compliant Users Summary Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    {/* Section Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl"></span>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Compliant Users ({complianceStats.compliantUsers})
                            </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Licensed users with active Defender devices
                        </p>
                    </div>
                    {/* Grid of Compliant Users (Limited to 6 for Space) */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {complianceStats.protectedUsers.slice(0, 6).map(({ user, devices }) => (
                                <div key={user.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    {/* User Information */}
                                    <div className="flex items-center space-x-3 mb-3">
                                        {/* User Avatar with Initial */}
                                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                            <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                                                {user.displayName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        {/* User Details */}
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white text-sm">{user.displayName}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">{user.mail}</p>
                                        </div>
                                    </div>
                                    {/* Device Information */}
                                    <div className="space-y-1">
                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                            {devices.length} device{devices.length !== 1 ? 's' : ''} protected
                                        </p>
                                        {/* Device Risk Level Badges */}
                                        <div className="flex flex-wrap gap-1">
                                            {devices.map((device, idx) => (
                                                <span key={idx} className={`px-2 py-1 text-xs rounded-full ${
                                                    device.riskLevel === RiskLevel.Low ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                                    device.riskLevel === RiskLevel.Medium ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                }`}>
                                                    {device.riskLevel}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Show count of additional compliant users if more than 6 */}
                        {complianceStats.protectedUsers.length > 6 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
                                ... and {complianceStats.protectedUsers.length - 6} more compliant users
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompliancePage;
