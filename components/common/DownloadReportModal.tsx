import React, { useState } from 'react';

interface DownloadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (date: string) => Promise<void>;
  title: string;
}

const DownloadReportModal: React.FC<DownloadReportModalProps> = ({ isOpen, onClose, onDownload, title }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDownloadClick = async () => {
    setLoading(true);
    await onDownload(selectedDate);
    setLoading(false);
    onClose();
  };
  
  const today = new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
        </div>
        
        <div className="p-6 space-y-4">
            <label htmlFor="reportDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Date</label>
            <input
              type="date"
              id="reportDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={today}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
            />
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownloadClick}
            disabled={!selectedDate || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary-hover disabled:bg-indigo-300"
          >
            {loading ? 'Downloading...' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadReportModal;
