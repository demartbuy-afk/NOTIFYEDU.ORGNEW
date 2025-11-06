import React from 'react';
import { Guard } from '../../types';
import GuardList from './GuardList';

interface GuardManagerProps {
  guards: Guard[];
}

const GuardManager: React.FC<GuardManagerProps> = ({ guards }) => {
  return (
    <div>
        <div className="mb-4">
            <h2 className="text-2xl font-bold text-neutral dark:text-gray-200">Manage Guards</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add, view, and manage security guards for your school.</p>
        </div>
        <GuardList guards={guards} />
    </div>
  );
};

export default GuardManager;
