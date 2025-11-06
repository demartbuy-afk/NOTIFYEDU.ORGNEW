import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Student, AttendanceLog } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import AttendanceLogList from './AttendanceLogList';

interface AttendanceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

const AttendanceHistoryModal: React.FC<AttendanceHistoryModalProps> = ({ isOpen, onClose, student }) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
          const historyLogs = await api.getStudentAttendanceHistory(student.student_id, user.token);
          setLogs(historyLogs);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isOpen, student, user]);
  
  if (!isOpen) return null;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }
    if (error) {
      return <div className="text-center text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-200 p-4 rounded-lg">{error}</div>;
    }
    const studentLogs = logs.filter(log => log.entity_type === 'student');
    return <AttendanceLogList logs={studentLogs} emptyMessage="No attendance history found for this student." />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
            Attendance History for {student.name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {renderContent()}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover"
            >
              Done
            </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistoryModal;