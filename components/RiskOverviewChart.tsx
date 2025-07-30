import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Device, RiskLevel } from '../types';

interface RiskOverviewChartProps {
    devices: Device[];
}

const COLORS = {
    [RiskLevel.High]: '#ef4444',
    [RiskLevel.Medium]: '#f59e0b',
    [RiskLevel.Low]: '#22c55e',
    [RiskLevel.Unknown]: '#6b7280',
};

const RiskOverviewChart: React.FC<RiskOverviewChartProps> = ({ devices }) => {
    const data = useMemo(() => {
        const counts = devices.reduce((acc, device) => {
            acc[device.riskLevel] = (acc[device.riskLevel] || 0) + 1;
            return acc;
        }, {} as Record<RiskLevel, number>);

        return Object.entries(counts).map(([name, value]) => ({
            name: name as RiskLevel,
            value,
        }));
    }, [devices]);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(31, 41, 55, 0.8)', /* bg-gray-800 with opacity */
                        borderColor: '#4b5563', /* border-gray-600 */
                        borderRadius: '0.5rem',
                    }}
                    labelStyle={{ color: '#d1d5db' /* text-gray-300 */ }}
                    itemStyle={{ color: '#f9fafb' /* text-gray-50 */ }}
                />
                <Legend iconType="circle" />
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    innerRadius={60} // This makes it a donut chart
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    );
};

export default RiskOverviewChart;
