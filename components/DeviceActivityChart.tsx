import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DeviceActivityChartProps {
    activeUsers: number;
    inactiveUsers: number;
    activityRate: number;
}

const DeviceActivityChart: React.FC<DeviceActivityChartProps> = ({ 
    activeUsers, 
    inactiveUsers, 
    activityRate 
}) => {
    const data = {
        labels: ['Active Users', 'Inactive Users'],
        datasets: [
            {
                data: [activeUsers, inactiveUsers],
                backgroundColor: [
                    '#10B981', // Green for active
                    '#EF4444', // Red for inactive
                ],
                borderColor: [
                    '#059669',
                    '#DC2626',
                ],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    color: '#6B7280',
                },
            },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = activeUsers + inactiveUsers;
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
    };

    const getActivityColor = (rate: number) => {
        if (rate >= 90) return 'text-green-600 dark:text-green-400';
        if (rate >= 70) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 relative min-h-0">
                <Doughnut data={data} options={options} />
            </div>
            <div className="mt-4 text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">Activity Rate</div>
                <div className={`text-2xl font-bold ${getActivityColor(activityRate)}`}>
                    {activityRate.toFixed(1)}%
                </div>
            </div>
        </div>
    );
};

export default DeviceActivityChart;