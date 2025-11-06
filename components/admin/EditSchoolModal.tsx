import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { School } from '../../types';

interface EditSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  token: string;
  onSuccess: (school: School) => void;
}

const EditSchoolModal: React.FC<EditSchoolModalProps> = ({ isOpen, onClose, school, token, onSuccess }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (school) {
      setName(school.name);
      setAddress(school.address);
      setContactNo(school.contact_no);
      // Format date for input type="date" which requires YYYY-MM-DD
      setExpiryDate(new Date(school.subscription_expiry_date).toISOString().split('T')[0]);
    }
  }, [school]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const schoolDetails: Partial<School> = { 
        name,
        address, 
        contact_no: contactNo,
        subscription_expiry_date: new Date(expiryDate).toISOString()
      };
      const updatedSchool = await api.updateSchool(token, school.id, schoolDetails);
      onSuccess(updatedSchool);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
                Edit School: {school.name}
              </h3>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
            </div>
            
            <div className="p-6 space-y-4">
                <div>
                    <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">School Name</label>
                    <input
                      type="text"
                      id="schoolName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                    />
                </div>
                <div>
                    <label htmlFor="schoolAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                    <input
                      type="text"
                      id="schoolAddress"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                    />
                </div>
                <div>
                    <label htmlFor="schoolContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Number</label>
                    <input
                      type="text"
                      id="schoolContact"
                      value={contactNo}
                      onChange={(e) => setContactNo(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                    />
                </div>
                <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subscription Expiry Date</label>
                    <input
                      type="date"
                      id="expiryDate"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
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
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EditSchoolModal;