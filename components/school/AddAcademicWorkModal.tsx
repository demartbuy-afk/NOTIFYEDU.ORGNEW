import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AcademicWork } from '../../types';

interface AddAcademicWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  token: string;
  onAcademicWorkAdded: (academicWork: AcademicWork) => void;
}

const AddAcademicWorkModal: React.FC<AddAcademicWorkModalProps> = ({ isOpen, onClose, schoolId, token, onAcademicWorkAdded }) => {
  const [name, setName] = useState('');
  const [academicWorkId, setAcademicWorkId] = useState('');
  const [password, setPassword] = useState('');
  const [isIdManuallyEdited, setIsIdManuallyEdited] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newAcademicWork, setNewAcademicWork] = useState<AcademicWork | null>(null);
  const [step, setStep] = useState<'details' | 'success'>('details');
  
  const generateSuggestedPassword = () => Math.random().toString(36).slice(-8);

  useEffect(() => {
    if (name.trim() && !isIdManuallyEdited) {
      const sanitizedName = name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      const randomSuffix = Math.random().toString(36).slice(2, 6);
      setAcademicWorkId(`acad_${sanitizedName}_${randomSuffix}`);
    }
  }, [name, isIdManuallyEdited]);

  useEffect(() => {
    if (isOpen && step === 'details') {
      setPassword(generateSuggestedPassword());
    }
  }, [isOpen, step]);

  const resetForm = () => {
    setName('');
    setAcademicWorkId('');
    setPassword('');
    setIsIdManuallyEdited(false);
    setLoading(false);
    setError(null);
    setNewAcademicWork(null);
    setStep('details');
  }

  const handleClose = () => {
    resetForm();
    onClose();
  }

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!academicWorkId || !password) {
        setError("Staff ID and Password are required.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const details = { name, academic_work_id: academicWorkId, password_auto: password };
      const academicWork = await api.addAcademicWork(schoolId, token, details);
      setNewAcademicWork(academicWork);
      onAcademicWorkAdded(academicWork);
      setStep('success');
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
            {step === 'details' ? 'Add New Academic Staff' : 'Academic Staff Added'}
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {step === 'details' ? (
            <form onSubmit={handleSubmitDetails} className="space-y-4">
              <div>
                <label htmlFor="academicWorkName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Staff Name</label>
                <input
                  type="text"
                  id="academicWorkName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="pt-2">
                 <label htmlFor="academicWorkId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Staff ID (Editable)</label>
                 <input
                     type="text"
                     id="academicWorkId"
                     value={academicWorkId}
                     onChange={(e) => {
                         setAcademicWorkId(e.target.value);
                         setIsIdManuallyEdited(true);
                     }}
                     required
                     className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                 />
             </div>
             <div>
                 <label htmlFor="academicWorkPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password (Editable)</label>
                 <div className="relative mt-1">
                     <input
                         type="text"
                         id="academicWorkPassword"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         required
                         className="block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                     />
                     <button
                         type="button"
                         onClick={() => setPassword(generateSuggestedPassword())}
                         className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-primary hover:text-primary-focus focus:outline-none"
                         aria-label="Regenerate password"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                     </button>
                 </div>
             </div>
              {error && <p className="text-red-500 text-sm pt-2">{error}</p>}
            </form>
          ) : (
            <div className="text-center space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Please provide these credentials to the staff. They will not be shown again.</p>
                <div className="text-left bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2 text-gray-800 dark:text-gray-200">
                    <p><strong>Name:</strong> {newAcademicWork?.name}</p>
                    <p><strong>Staff ID:</strong> <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{newAcademicWork?.academic_work_id}</code></p>
                    <p><strong>Password:</strong> <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{newAcademicWork?.password_auto}</code></p>
                </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-3">
          {step === 'details' ? (
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
                onClick={handleSubmitDetails}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus disabled:bg-indigo-300 dark:disabled:bg-indigo-800"
              >
                {loading ? 'Adding...' : 'Add Staff'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddAcademicWorkModal;
