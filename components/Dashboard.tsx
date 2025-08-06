import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { getUsers, getAllDevices } from '../services/microsoftApi';
import { User, Device, RiskLevel, UserRole } from '../types';
import { exportUsersToCsv } from '../utils/export';

import UserList from './UserList';
import KpiCard from './KpiCard';
import ThemeToggle from './ThemeToggle';
import RiskOverviewChart from './RiskOverviewChart';
import DeviceOSChart from './DeviceOSChart';
import { SearchIcon, RefreshIcon, LogoutIcon, DocumentArrowDownIcon, UsersIcon, ShieldCheckIcon, ClockIcon } from './icons';


interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
  onNavigate?: (page: 'dashboard' | 'devices') => void;
}

const Panel: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className = "" }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md h-full flex flex-col ${className}`}>
    <h3 className="text-lg font-semibold p-4 border-b border-gray-200 dark:border-gray-700">{title}</h3>
    <div className="p-4 flex-grow overflow-auto">
      {children}
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ currentUser, onLogout, onNavigate }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [riskFilter, setRiskFilter] = useState<RiskLevel | 'All'>('All');
    const [lastSynced, setLastSynced] = useState<Date | null>(null);

    const isUserAdmin = currentUser.role === UserRole.Admin;

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔄 Fetching data from Microsoft APIs...');
            const [userResponse, deviceResponse] = await Promise.all([getUsers(), getAllDevices()]);
            setUsers(userResponse);
            setDevices(deviceResponse);
            setLastSynced(new Date());
            console.log('✅ Data fetched successfully');
        } catch (error: any) {
            console.error("❌ Failed to fetch data", error);
            setError(error.message || 'Failed to fetch data from Microsoft APIs');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredUsers = useMemo(() => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        
        const userIdsWithRisk = new Set<string>();
        if (riskFilter !== 'All') {
            devices.forEach(device => {
                if (device.riskLevel === riskFilter) {
                    userIdsWithRisk.add(device.userId);
                }
            });
        }

        return users.filter(user => {
            const matchesSearch = user.displayName.toLowerCase().includes(lowercasedSearchTerm) ||
                                  user.mail.toLowerCase().includes(lowercasedSearchTerm);

            if (riskFilter === 'All') {
                return matchesSearch;
            }

            return matchesSearch && userIdsWithRisk.has(user.id);
        });
    }, [users, devices, searchTerm, riskFilter]);
    
    const devicesAtRisk = useMemo(() => {
        return devices.filter(d => d.riskLevel === RiskLevel.High || d.riskLevel === RiskLevel.Medium).length;
    }, [devices]);
    
    const handleExport = () => {
        exportUsersToCsv(filteredUsers, devices, `SecureOps-Report-${new Date().toISOString().split('T')[0]}.csv`);
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-semibold">SecureOps Command Center</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Welcome, {currentUser.displayName} ({currentUser.role})</p>
                </div>
                <div className="flex items-center space-x-4">
                    {onNavigate && (
                        <button
                            onClick={() => onNavigate('devices')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        >
                            View Devices
                        </button>
                    )}
                    <ThemeToggle />
                    <button
                      onClick={onLogout}
                      className="p-2 text-gray-500 rounded-full hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                      aria-label="Logout"
                    >
                      <LogoutIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>

            <main className="p-4 md:p-6 lg:p-8">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
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
                        <div className="flex items-center gap-4">
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
                             <button
                                onClick={handleExport}
                                disabled={!isUserAdmin}
                                className="p-2 h-full bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center transition"
                                aria-label="Export to CSV"
                                title={!isUserAdmin ? "You must be an Admin to export data" : "Export to CSV"}
                            >
                                <DocumentArrowDownIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={fetchData}
                                disabled={loading || !isUserAdmin}
                                className="p-2 h-full bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-primary-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center transition"
                                aria-label="Refresh Data"
                                title={!isUserAdmin ? "You must be an Admin to refresh data" : "Refresh Data"}
                            >
                                <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KpiCard title="Total Users" value={users.length} icon={<UsersIcon className="h-6 w-6"/>} />
                        <KpiCard title="Total Devices" value={devices.length} icon={<ShieldCheckIcon className="h-6 w-6"/>} />
                        <KpiCard title="Devices at Risk" value={devicesAtRisk} icon={<ShieldCheckIcon className="h-6 w-6"/>} />
                        <KpiCard title="Last Synced" value={lastSynced ? lastSynced.toLocaleTimeString() : 'N/A'} icon={<ClockIcon className="h-6 w-6"/>} />
                    </div>
                    <div className="lg:col-span-4 h-96">
                      <Panel title="Device Risk Overview"><RiskOverviewChart devices={devices} /></Panel>
                    </div>
                    <div className="lg:col-span-8 h-96">
                      <Panel title="Device OS Distribution"><DeviceOSChart devices={devices} /></Panel>
                    </div>
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