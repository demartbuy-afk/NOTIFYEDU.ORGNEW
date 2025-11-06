import React, { useState } from 'react';
import { api } from '../../services/api';
import { School } from '../../types';

interface AddSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onSchoolAdded: (school: School) => void;
}

const AddSchoolModal: React.FC<AddSchoolModalProps> = ({ isOpen, onClose, token, onSchoolAdded }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('password123');
  const [address, setAddress] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSchool, setNewSchool] = useState<School | null>(null);

  const resetForm = () => {
    setName('');
    setPassword('password123');
    setAddress('');
    setContactNo('');
    setLoading(false);
    setError(null);
    setNewSchool(null);
  }

  const handleClose = () => {
    resetForm();
    onClose();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim() || !address.trim() || !contactNo.trim()) {
        setError("Please fill out all fields before adding a school.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const schoolDetails = { 
        name, 
        password, 
        address, 
        contact_no: contactNo, 
      };
      const school = await api.createSchool(token, schoolDetails);
      setNewSchool(school);
      onSchoolAdded(school);
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
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
            {newSchool ? 'School Added Successfully' : 'Add New School'}
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
        </div>
        
        <div className="p-6">
          {newSchool ? (
            <div className="text-center space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Please save these credentials securely. They will not be shown again.</p>
                <div className="text-left bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2 text-gray-800 dark:text-gray-200">
                    <p><strong>School Name:</strong> {newSchool.name}</p>
                    <p><strong>School ID:</strong> <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{newSchool.id}</code></p>
                    <p><strong>Password:</strong> <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{newSchool.password}</code></p>
                    <p><strong>Address:</strong> {newSchool.address}</p>
                    <p><strong>Contact No.:</strong> {newSchool.contact_no}</p>
                </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label htmlFor="schoolPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Default Password</label>
                <input
                  type="text"
                  id="schoolPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-3">
          {newSchool ? (
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus"
            >
              Done
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus disabled:bg-indigo-300 dark:disabled:bg-indigo-800"
              >
                {loading ? 'Adding...' : 'Add School'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddSchoolModal;