
import React from 'react';

interface KpiCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon }) => {
    return (
        <div className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800 flex items-center">
            <div className="p-3 mr-4 text-primary-500 bg-primary-100 rounded-full dark:bg-gray-700 dark:text-primary-400">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
};

export default KpiCard;
