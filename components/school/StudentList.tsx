

import React from 'react';
import { Student } from '../../types';

interface StudentListProps {
  students: Student[];
  onViewQr: (student: Student) => void;
  onSendMessage: (student: Student) => void;
  onDelete: (student: Student) => void;
  onViewHistory: (student: Student) => void;
  searchQuery?: string;
}

const StudentList: React.FC<StudentListProps> = ({ students, onViewQr, onSendMessage, onDelete, onViewHistory, searchQuery }) => {
  if (students.length === 0) {
    if (searchQuery && searchQuery.trim() !== '') {
        return <p className="text-center text-gray-500 dark:text-gray-400 py-4">No students match your search criteria.</p>;
    }
    return <p className="text-center text-gray-500 dark:text-gray-400 py-4">No students found. Add a new student to get started.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Student ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Roll No.
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Class
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Parent Phone
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {students.map((student) => (
            <tr key={student.student_id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{student.student_id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{student.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{student.roll_no}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{student.class}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{student.parent_phone}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                <div className="flex justify-center items-center space-x-4">
                  <button 
                    onClick={() => onViewHistory(student)} 
                    className="text-gray-500 hover:text-blue-500 transition-colors"
                    aria-label={`View attendance history for ${student.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => onViewQr(student)} 
                    className="text-gray-500 hover:text-primary transition-colors"
                    aria-label={`View QR code for ${student.name}`}
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6.5 6.5v-1m-6.5-5.5h-2m14 0h2M12 20.5v-1M4.5 12h-2M7 7H5.5v1.5M17 7h1.5v1.5M7 17H5.5V15.5M17 17h1.5V15.5" />
                     </svg>
                  </button>
                  <button 
                    onClick={() => onSendMessage(student)} 
                    className="text-gray-500 hover:text-secondary transition-colors"
                    aria-label={`Send message to ${student.name}'s parent`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  </button>
                   <button 
                    onClick={() => onDelete(student)} 
                    className="text-gray-500 hover:text-red-600 transition-colors"
                    aria-label={`Delete student ${student.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

export default StudentList;