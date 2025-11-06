import React, { useState } from 'react';
import { api } from '../../services/api';
import { Student } from '../../types';

interface SendMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  token: string;
  onSuccess: () => void;
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({ isOpen, onClose, student, token, onSuccess }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 5) {
      setError("Please enter a meaningful message.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.sendMessageToParent(student.school_id, token, student.student_id, text);
      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b dark:border-gray-700">
            <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
              Send Message to {student.name}'s Parent
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="messageText" className="sr-only">Message</label>
              <textarea
                id="messageText"
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary"
                placeholder={`e.g., Dear Parent, ${student.name} needs to focus more on homework...`}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary-hover disabled:bg-indigo-300"
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendMessageModal;