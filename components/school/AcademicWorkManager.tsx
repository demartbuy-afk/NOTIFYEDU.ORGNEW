import React from 'react';
import { AcademicWork } from '../../types';
import AcademicWorkList from './AcademicWorkList';

interface AcademicWorkManagerProps {
  academicWorks: AcademicWork[];
}

const AcademicWorkManager: React.FC<AcademicWorkManagerProps> = ({ academicWorks }) => {
  return (
    <div>
        <div className="mb-4">
            <h2 className="text-2xl font-bold text-neutral dark:text-gray-200">Manage Academic Staff</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add, view, and manage academic staff for your school.</p>
        </div>
        <AcademicWorkList academicWorks={academicWorks} />
    </div>
  );
};

export default AcademicWorkManager;
