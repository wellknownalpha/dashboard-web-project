import React, { useState, useEffect, useMemo } from 'react';
import { Device, RiskLevel } from '../types';
import { getAllDevices } from '../services/microsoftApi';
import { SearchIcon, RefreshIcon } from './icons';
import ThemeToggle from './ThemeToggle';

const RiskChip: React.FC<{ risk: string }> = ({ risk }) => {
    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(risk)}`}>
            {risk}
        </span>
    );
};

interface DevicesPageProps {
    onNavigate?: (page: 'dashboard' | 'devices') => void;
}

const DevicesPage: React.FC<DevicesPageProps> = ({ onNavigate }) => {
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [osFilter, setOSFilter] = useState<string>('All');
    const [riskFilter, setRiskFilter] = useState<string>('All');

    const fetchDevices = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3001/api/devices');
            if (!response.ok) throw new Error('Failed to fetch devices');
            const deviceData = await response.json();
            console.log('✅ Fetched devices:', deviceData.length);
            setDevices(deviceData);
        } catch (error: any) {
            console.error('❌ Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const filteredDevices = useMemo(() => {
        return devices.filter(device => {
            const deviceName = device.deviceName || device.id || 'Unknown Device';
            const matchesSearch = deviceName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 (device.os || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesOS = osFilter === 'All' || device.os === osFilter;
            const matchesRisk = riskFilter === 'All' || device.riskLevel === riskFilter;
            return matchesSearch && matchesOS && matchesRisk;
        });
    }, [devices, searchTerm, osFilter, riskFilter]);

    const uniqueOS = [...new Set(devices.map(d => d.os).filter(Boolean))];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-semibold">Device Management</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Microsoft Defender Devices ({devices.length} total)</p>
                </div>
                <div className="flex items-center space-x-4">
                    {onNavigate && (
                        <button
                            onClick={() => onNavigate('dashboard')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        >
                            ← Dashboard
                        </button>
                    )}
                    <ThemeToggle />
                </div>
            </header>

            <main className="p-4 md:p-6 lg:p-8">
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                        <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search devices..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"
                            />
                        </div>
                        <select
                            value={osFilter}
                            onChange={e => setOSFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"
                        >
                            <option value="All">All OS</option>
                            {uniqueOS.map(os => (
                                <option key={os} value={os}>{os}</option>
                            ))}
                        </select>
                        <select
                            value={riskFilter}
                            onChange={e => setRiskFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700"
                        >
                            <option value="All">All Risk Levels</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                        <button
                            onClick={fetchDevices}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold p-4 border-b border-gray-200 dark:border-gray-700">
                        Devices ({filteredDevices.length})
                    </h3>
                    <div className="p-4">
                        {loading ? (
                            <div className="text-center py-8">Loading devices...</div>
                        ) : filteredDevices.length === 0 ? (
                            <div className="text-center py-12">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">No devices found</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filter.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredDevices.map((device) => (
                                    <div key={device.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {device.deviceName || `Device-${device.id.substring(0, 8)}`}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{device.os}</p>
                                            </div>
                                            <div className="text-center">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    device.healthStatus === 'Active' 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                                                }`}>
                                                    {device.healthStatus}
                                                </span>
                                            </div>
                                            <div className="text-center">
                                                <RiskChip risk={device.riskLevel} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm text-gray-900 dark:text-white">
                                                    {new Date(device.lastSeen).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Last Seen</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                    {device.id.substring(0, 8)}...
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DevicesPage;