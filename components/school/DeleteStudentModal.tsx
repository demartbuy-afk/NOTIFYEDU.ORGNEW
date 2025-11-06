import React, { useState } from 'react';
import { api } from '../../services/api';
import { Student } from '../../types';

interface DeleteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  token: string;
  onSuccess: () => void;
}

const DeleteStudentModal: React.FC<DeleteStudentModalProps> = ({ isOpen, onClose, student, token, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteStudent(student.school_id, token, student.student_id);
      onSuccess();
    } catch (err) {
      setError((err as Error).message || "Failed to delete student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4">Confirm Deletion</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Are you sure you want to delete the student <strong className="font-semibold">{student.name}</strong>? 
              This action is irreversible and will remove all associated data.
            </p>
          </div>
          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
          >
            {loading ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteStudentModal;