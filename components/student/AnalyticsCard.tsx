

import React from 'react';

interface AnalyticsCardProps {
  title: string;
  value: string;
  color: 'green' | 'red' | 'blue' | 'yellow';
}

const colorClasses = {
  green: 'from-green-400 to-emerald-500',
  red: 'from-red-400 to-rose-500',
  blue: 'from-blue-400 to-indigo-500',
  yellow: 'from-yellow-400 to-amber-500',
};

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, value, color }) => {
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} text-white p-6 rounded-xl shadow-lg`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  );
};

export default AnalyticsCard;