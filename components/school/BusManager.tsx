import React from 'react';
import { Bus } from '../../types';
import BusList from './BusList';

interface BusManagerProps {
  buses: Bus[];
}

const BusManager: React.FC<BusManagerProps> = ({ buses }) => {
  return (
    <div>
        <div className="mb-4">
            <h2 className="text-2xl font-bold text-neutral dark:text-gray-200">Manage Bus Staff</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add, view, and manage bus drivers and conductors.</p>
        </div>
        <BusList buses={buses} />
    </div>
  );
};

export default BusManager;