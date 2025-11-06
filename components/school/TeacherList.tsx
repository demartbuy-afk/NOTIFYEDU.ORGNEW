import React from 'react';
import { Teacher } from '../../types';

interface TeacherListProps {
  teachers: Teacher[];
  onViewQr: (teacher: Teacher) => void;
  onViewHistory: (teacher: Teacher) => void;
}

const TeacherList: React.FC<TeacherListProps> = ({ teachers, onViewQr, onViewHistory }) => {
  if (teachers.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-4">No teachers found. Add a new teacher to get started.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Teacher ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Subject
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Phone Number
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {teachers.map((teacher) => (
            <tr key={teacher.teacher_id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{teacher.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-300">{teacher.teacher_id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{teacher.subject}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{teacher.phone_number}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                <div className="flex justify-center items-center space-x-4">
                  <button 
                    onClick={() => onViewHistory(teacher)} 
                    className="text-gray-500 hover:text-blue-500 transition-colors"
                    aria-label={`View attendance history for ${teacher.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => onViewQr(teacher)} 
                    className="text-gray-500 hover:text-primary transition-colors"
                    aria-label={`View QR code for ${teacher.name}`}
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6.5 6.5v-1m-6.5-5.5h-2m14 0h2M12 20.5v-1M4.5 12h-2M7 7H5.5v1.5M17 7h1.5v1.5M7 17H5.5V15.5M17 17h1.5V15.5" />
                     </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeacherList;