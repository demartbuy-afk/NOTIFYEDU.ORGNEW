import React from 'react';
import { AttendanceLog, AttendanceStatus } from '../../types';

interface RecentAttendanceProps {
  logs: AttendanceLog[];
}

const RecentAttendance: React.FC<RecentAttendanceProps> = ({ logs }) => {
  if (logs.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-4">No recent activity found.</p>;
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };
  
  const getStatusPill = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.IN:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">IN</span>;
      case AttendanceStatus.OUT:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">OUT</span>;
      case AttendanceStatus.BUS_IN:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">BUS IN</span>;
      case AttendanceStatus.BUS_OUT:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">BUS OUT</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100">{status}</span>;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Date & Time
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {logs.map((log) => (
            <tr key={log.log_id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatTimestamp(log.timestamp)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{getStatusPill(log.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentAttendance;