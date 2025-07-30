import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Device } from '../types';

interface DeviceOSChartProps {
    devices: Device[];
}

const DeviceOSChart: React.FC<DeviceOSChartProps> = ({ devices }) => {
    const data = useMemo(() => {
        const osCounts = devices.reduce((acc, device) => {
            acc[device.os] = (acc[device.os] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(osCounts).map(([name, count]) => ({
            name,
            count,
        }));
    }, [devices]);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
                <YAxis tick={{ fill: '#9ca3af' }} />
                <Tooltip
                     contentStyle={{
                        backgroundColor: 'rgba(31, 41, 55, 0.8)',
                        borderColor: '#4b5563',
                        borderRadius: '0.5rem',
                    }}
                    labelStyle={{ color: '#d1d5db' }}
                    itemStyle={{ color: '#60a5fa' }}
                />
                <Legend />
                <Bar dataKey="count" name="Device Count" fill="#60a5fa" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default DeviceOSChart;
