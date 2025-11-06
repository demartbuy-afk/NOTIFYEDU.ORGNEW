import React, { useState } from 'react';
import { api } from '../../services/api';

interface ComplaintBoxProps {
  studentId: string;
  token: string;
}

const ComplaintBox: React.FC<ComplaintBoxProps> = ({ studentId, token }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 10) {
      setError("Please provide more details (minimum 10 characters).");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.submitComplaint(studentId, token, text);
      setSuccess("Your feedback has been submitted successfully!");
      setText('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 4000);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-neutral dark:text-gray-200 mb-4">Submit a Complaint or Feedback</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="complaintText" className="sr-only">Complaint or Feedback</label>
          <textarea
            id="complaintText"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Please share your concerns or suggestions here..."
          />
        </div>
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus disabled:bg-indigo-300 dark:disabled:bg-indigo-800 transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
        <div className="h-5 mt-2 text-center">
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-500">{success}</p>}
        </div>
      </form>
    </div>
  );
};

export default ComplaintBox;