import React from 'react';

interface ComplianceChartProps {
    compliantUsers: number;
    nonCompliantUsers: number;
    complianceRate: number;
}

const ComplianceChart: React.FC<ComplianceChartProps> = ({ 
    compliantUsers, 
    nonCompliantUsers, 
    complianceRate 
}) => {
    const total = compliantUsers + nonCompliantUsers;
    const compliantPercentage = total > 0 ? (compliantUsers / total) * 100 : 0;
    const nonCompliantPercentage = total > 0 ? (nonCompliantUsers / total) * 100 : 0;

    const getComplianceColor = (rate: number) => {
        if (rate >= 90) return 'text-green-600 dark:text-green-400';
        if (rate >= 70) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getComplianceStatus = (rate: number) => {
        if (rate >= 90) return { status: 'Excellent', icon: '🟢' };
        if (rate >= 70) return { status: 'Good', icon: '🟡' };
        return { status: 'Poor', icon: '🔴' };
    };

    const { status, icon } = getComplianceStatus(complianceRate);

    return (
        <div className="space-y-4">
            {/* Compliance Status Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{icon}</span>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Compliance Status</h4>
                        <p className={`text-sm font-medium ${getComplianceColor(complianceRate)}`}>
                            {status} - {complianceRate.toFixed(1)}%
                        </p>
                    </div>
                </div>
                <div className={`text-2xl font-bold ${getComplianceColor(complianceRate)}`}>
                    {complianceRate.toFixed(0)}%
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Compliant: {compliantUsers}</span>
                    <span>Non-Compliant: {nonCompliantUsers}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${compliantPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Donut Chart */}
            <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                        {/* Background circle */}
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-gray-200 dark:text-gray-700"
                        />
                        {/* Compliant arc */}
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray={`${compliantPercentage}, 100`}
                            className={complianceRate >= 90 ? 'text-green-500' : 
                                     complianceRate >= 70 ? 'text-yellow-500' : 'text-red-500'}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className={`text-lg font-bold ${getComplianceColor(complianceRate)}`}>
                                {complianceRate.toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Compliant
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center space-x-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">Protected ({compliantUsers})</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">Unprotected ({nonCompliantUsers})</span>
                </div>
            </div>
        </div>
    );
};

export default ComplianceChart;