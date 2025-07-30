
import React from 'react';
import { Device, RiskLevel } from '../types';

interface DeviceTableProps {
    devices: Device[];
}

const RiskChip: React.FC<{ risk: RiskLevel }> = ({ risk }) => {
    const riskColorClasses = {
        [RiskLevel.High]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        [RiskLevel.Medium]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        [RiskLevel.Low]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        [RiskLevel.Unknown]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${riskColorClasses[risk]}`}>
            {risk}
        </span>
    );
};

const DeviceTable: React.FC<DeviceTableProps> = ({ devices }) => {
    if (devices.length === 0) {
        return <p className="p-4 text-sm text-center text-gray-500 dark:text-gray-400">No devices found for this user.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Device Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">OS</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Health Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Risk Level</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Seen</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {devices.map((device) => (
                        <tr key={device.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{device.deviceName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{device.os}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{device.healthStatus}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <RiskChip risk={device.riskLevel} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(device.lastSeen).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DeviceTable;
