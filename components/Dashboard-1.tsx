// React imports for hooks and component functionality
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Microsoft API services for fetching user and device data
import { getUsers, getAllDevices } from '../services/microsoftApi';
// Service for mapping devices to users based on various identifiers
import { mapDevicesToUsers } from '../services/deviceUserMapping';

// TypeScript interfaces for type safety
import { User, Device, RiskLevel, UserRole } from '../types';
// Utility for exporting user data to CSV format
import { exportUsersToCsv } from '../utils/export';

// UI Components for dashboard layout and functionality
import UserList from './UserList';           // Displays users and their associated devices
import KpiCard from './KpiCard';             // Key Performance Indicator cards
import ThemeToggle from './ThemeToggle';     // Dark/Light theme switcher
import RiskOverviewChart from './RiskOverviewChart';  // Chart showing device risk distribution
import DeviceOSChart from './DeviceOSChart'; // Chart showing OS distribution across devices
import ComplianceChart from './ComplianceChart';      // Chart showing compliance statistics
import DeviceActivityCard from './DeviceActivityCard'; // Card showing device activity compliance

// Icon components for UI elements
import { SearchIcon, RefreshIcon, LogoutIcon, DocumentArrowDownIcon, UsersIcon, ShieldCheckIcon, ClockIcon } from './icons';

// Utilities for compliance reporting and PDF generation
import { exportComplianceReport, getComplianceStats } from '../utils/complianceExport';
import { checkInactiveDevicesAndNotify } from '../services/notificationService';
import { exportDashboardToPDF } from '../utils/pdfExport';
import { EmailAlertService } from '../services/emailAlertService';


/**
 * Props interface for the Dashboard component
 * @interface DashboardProps
 * @property {User} currentUser - The currently authenticated user with role-based permissions
 * @property {Function} onLogout - Callback function to handle user logout
 * @property {Function} onNavigate - Optional navigation callback for routing between pages
 */
interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
  onNavigate?: (page: 'dashboard' | 'devices') => void;
}

/**
 * Reusable Panel component for consistent layout across dashboard sections
 * Provides a standardized container with title header and content area
 * @param {string} title - The panel title displayed in the header
 * @param {React.ReactNode} children - Content to be rendered inside the panel
 * @param {string} className - Additional CSS classes for customization
 */
const Panel: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className = "" }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md h-full flex flex-col ${className}`}>
    {/* Panel header with title */}
    <h3 className="text-lg font-semibold p-4 border-b border-gray-200 dark:border-gray-700">{title}</h3>
    {/* Panel content area with scroll capability */}
    <div className="p-4 flex-grow overflow-auto">
      {children}
    </div>
  </div>
);

/**
 * Main Dashboard Component
 * Provides a unified view of Microsoft 365 users and Microsoft Defender devices
 * Features real-time data, compliance monitoring, and administrative controls
 */
const Dashboard: React.FC<DashboardProps> = ({ currentUser, onLogout, onNavigate }) => {
    // State management for dashboard data
    const [users, setUsers] = useState<User[]>([]);                    // Microsoft Graph API users
    const [devices, setDevices] = useState<Device[]>([]);              // Microsoft Defender devices
    const [loading, setLoading] = useState(true);                      // Loading state for API calls
    const [error, setError] = useState<string | null>(null);           // Error state for API failures
    const [searchTerm, setSearchTerm] = useState('');                  // User search functionality
    const [riskFilter, setRiskFilter] = useState<RiskLevel | 'All'>('All'); // Risk level filtering
    const [lastSynced, setLastSynced] = useState<Date | null>(null);   // Last successful data sync timestamp
    const [sendingAlerts, setSendingAlerts] = useState(false);         // Email alert sending state

    // Role-based access control - only Admins and GlobalAdmins can perform certain actions
    const isUserAdmin = currentUser.role === UserRole.Admin || currentUser.role === UserRole.GlobalAdmin;

    /**
     * Fetches data from Microsoft Graph API and Defender API
     * Performs parallel API calls for better performance
     * Maps devices to users using various identification strategies
     */
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔄 Fetching data from Microsoft APIs...');
            
            // Parallel API calls to Microsoft Graph (users) and Defender (devices)
            const [userResponse, deviceResponse] = await Promise.all([getUsers(), getAllDevices()]);
            
            // Map devices to users using Azure AD IDs, emails, and machine tags
            const mappedDevices = mapDevicesToUsers(userResponse, deviceResponse);
            
            // Log successful data retrieval with statistics
            console.log('📊 Device mapping completed:', {
                users: userResponse.length,
                devices: mappedDevices.length,
                riskLevels: mappedDevices.reduce((acc, d) => {
                    acc[d.riskLevel] = (acc[d.riskLevel] || 0) + 1;
                    return acc;
                }, {})
            });
            
            // Update component state with fetched data
            setUsers(userResponse);
            setDevices(mappedDevices);
            setLastSynced(new Date());
            console.log('✅ Data fetched successfully');
        } catch (error: any) {
            console.error("❌ Failed to fetch data", error);
            setError(error.message || 'Failed to fetch data from Microsoft APIs');
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial data fetch when component mounts
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /**
     * Monitor device activity and send notifications for inactive devices
     * Runs whenever user or device data changes
     * Identifies users with devices inactive for more than 14 days
     */
    useEffect(() => {
        if (users.length > 0 && devices.length > 0) {
            checkInactiveDevicesAndNotify(users, devices);
        }
    }, [users, devices]);

    /**
     * Filtered user list based on search term and risk level
     * Memoized for performance optimization
     * Supports searching by name or email, and filtering by device risk level
     */
    const filteredUsers = useMemo(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        
        // Create a set of user IDs that have devices with the selected risk level
        const userIdsWithRisk = new Set<string>();
        if (riskFilter !== 'All') {
            devices.forEach(device => {
                if (device.riskLevel === riskFilter) {
                    userIdsWithRisk.add(device.userId);
                }
            });
        }

        // Filter users based on search criteria and risk level
        return users.filter(user => {
            // Check if user matches search term (name or email)
            const matchesSearch = user.displayName.toLowerCase().includes(lowercasedSearchTerm) ||
                                  user.mail.toLowerCase().includes(lowercasedSearchTerm);

            // If no risk filter is applied, return all matching users
            if (riskFilter === 'All') {
                return matchesSearch;
            }

            // Return users that match search AND have devices with selected risk level
            return matchesSearch && userIdsWithRisk.has(user.id);
        });
    }, [users, devices, searchTerm, riskFilter]);
    
    /**
     * Calculate number of high-risk devices for KPI display
     * Only counts devices with 'High' risk level (not Medium or Low)
     * Memoized to prevent unnecessary recalculations
     */
    const devicesAtRisk = useMemo(() => {
        const highRiskDevices = devices.filter(d => d.riskLevel === 'High');
        console.log('📊 High risk devices:', highRiskDevices.length);
        return highRiskDevices.length;
    }, [devices]);
    
    /**
     * Export filtered user data to CSV format
     * Includes user information and associated device details
     * Filename includes current date for organization
     */
    const handleExport = () => {
        exportUsersToCsv(filteredUsers, devices, `SecureOps-Report-${new Date().toISOString().split('T')[0]}.csv`);
    }

    /**
     * Export compliance report showing users with/without Defender protection
     * Generates detailed CSV with compliance status and risk assessment
     */
    const handleComplianceExport = () => {
        exportComplianceReport(users, devices, `Compliance-Report-${new Date().toISOString().split('T')[0]}.csv`);
    }

    // Calculate compliance statistics for dashboard display
    const complianceStats = getComplianceStats(users, devices);

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <main className="p-4 md:p-6 lg:p-8">
                {/* Search and Filter Controls */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        {/* Search Input with Icon */}
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        {/* Action Buttons and Filters */}
                        <div className="flex items-center gap-4">
                            {/* Risk Level Filter Dropdown */}
                            <select
                                value={riskFilter}
                                onChange={e => setRiskFilter(e.target.value as RiskLevel | 'All')}
                                className="h-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="All">All Risk Levels</option>
                                <option value={RiskLevel.Low}>Low</option>
                                <option value={RiskLevel.Medium}>Medium</option>
                                <option value={RiskLevel.High}>High</option>
                            </select>
                            {/* Export Users CSV Button - Admin Only */}
                            <button
                                onClick={handleExport}
                                disabled={!isUserAdmin}
                                className="p-2 h-full bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center transition"
                                title={!isUserAdmin ? "Admin access required" : "Export Users CSV"}
                            >
                                <DocumentArrowDownIcon className="w-5 h-5" />
                            </button>
                            {/* Export Compliance Report Button - Admin Only */}
                            <button
                                onClick={() => exportComplianceReport(users, devices)}
                                disabled={!isUserAdmin}
                                className="p-2 h-full bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center transition"
                                title={!isUserAdmin ? "Admin access required" : "Export Compliance Report"}
                            >
                                <ShieldCheckIcon className="w-5 h-5" />
                            </button>
                            {/* Export Dashboard PDF Button - Admin Only */}
                            <button
                                onClick={() => exportDashboardToPDF(users, devices)}
                                disabled={!isUserAdmin}
                                className="p-2 h-full bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-orange-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center transition"
                                title={!isUserAdmin ? "Admin access required" : "Export Dashboard PDF"}
                            >
                                <DocumentArrowDownIcon className="w-5 h-5" />
                            </button>
                            
                            {/* Send Email Alerts Button - Admin Only */}
                            <button
                                onClick={async () => {
                                    setSendingAlerts(true);
                                    try {
                                        const result = await EmailAlertService.sendComplianceAlerts(users, devices);
                                        alert(`✅ Successfully sent ${result.alertsSent} compliance alerts to non-compliant users`);
                                    } catch (error) {
                                        alert('❌ Failed to send compliance alerts');
                                    } finally {
                                        setSendingAlerts(false);
                                    }
                                }}
                                disabled={!isUserAdmin || sendingAlerts}
                                className="p-2 h-full bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center transition"
                                title={!isUserAdmin ? "Admin access required" : "Send Email Alerts to Non-Compliant Users"}
                            >
                                <span className="text-sm">{sendingAlerts ? '⏳' : '📧'}</span>
                            </button>
                            {/* Refresh Data Button - Admin Only */}
                            <button
                                onClick={fetchData}
                                disabled={loading || !isUserAdmin}
                                className="p-2 h-full bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center transition"
                                title={!isUserAdmin ? "Admin access required" : "Refresh Data"}
                            >
                                <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>

                        </div>
                    </div>
                </div>

                {/* Error Display for API Connection Issues */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Microsoft API Connection Error</h3>
                                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                                <p className="text-xs text-red-600 dark:text-red-400 mt-2">Please check your Azure app registration credentials and API permissions.</p>
                            </div>
                        </div>
                    </div>
                )}



                {/* Loading Indicator */}
                {loading && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <p className="text-blue-800 dark:text-blue-200">Loading Microsoft 365 and Defender data...</p>
                        </div>
                    </div>
                )}

                {/* Dashboard Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Key Performance Indicators (KPIs) Row */}
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KpiCard title="Total Users" value={users.length} icon={<UsersIcon className="h-6 w-6"/>} />
			<KpiCard 
    title="Total Devices" 
    value={devices.filter(device => device.machineTags && device.machineTags.length > 0).length} 
    icon={<ShieldCheckIcon className="h-6 w-6"/>} 
/>{/* <KpiCard title="Total Devices" value={devices.length} icon={<ShieldCheckIcon className="h-6 w-6"/>} /> */}
                        <KpiCard title="High Risk Devices" value={devicesAtRisk} icon={<ShieldCheckIcon className="h-6 w-6"/>} />
                        <KpiCard title="Last Synced" value={lastSynced ? lastSynced.toLocaleTimeString() : 'N/A'} icon={<ClockIcon className="h-6 w-6"/>} />
                    </div>
                    {/* Charts and Analytics Row - 4 columns */}
                    {/* Device Risk Distribution Chart */}
                    <div className="lg:col-span-3 h-96" data-chart="risk-overview">
                      <Panel title="Device Risk Overview"><RiskOverviewChart devices={devices} /></Panel>
                    </div>
                    
                    {/* Compliance Status Chart */}
                    <div className="lg:col-span-3 h-96" data-chart="compliance">
                      <Panel title="Compliance Status of users">
                        <ComplianceChart 
                          compliantUsers={complianceStats.compliantUsers}
                          nonCompliantUsers={complianceStats.nonCompliantUsers}
                          complianceRate={complianceStats.complianceRate}
                        />
                      </Panel>
                    </div>
                    
                    {/* Operating System Distribution Chart */}
                    <div className="lg:col-span-3 h-96" data-chart="os-distribution">
                      <Panel title="Device OS Distribution"><DeviceOSChart devices={devices} /></Panel>
                    </div>
                    
                    {/* Device Activity Compliance Card */}
                    <div className="lg:col-span-3 h-96" data-chart="device-activity">
                      <DeviceActivityCard users={users} devices={devices} />
                    </div>
                    {/* Users and Devices Table - Full Width */}
                    <div className="lg:col-span-12">
                      <Panel title="Users & Devices" className="!p-0">
                        <UserList users={filteredUsers} devices={devices} loading={loading} />
                      </Panel>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
