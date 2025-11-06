import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Student } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onSuccess: () => void;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ isOpen, onClose, student, onSuccess }) => {
  const { user } = useAuth();
  const [totalFees, setTotalFees] = useState(0);
  const [feesPaid, setFeesPaid] = useState(0);
  const [newPayment, setNewPayment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (student) {
      setTotalFees(student.total_fees || 0);
      setFeesPaid(student.fees_paid || 0);
      setNewPayment(''); // Reset new payment field when student changes
    }
  }, [student]);

  const handleRecordPayment = () => {
    const amount = parseFloat(newPayment);
    if (!isNaN(amount) && amount > 0) {
      setFeesPaid(prevPaid => prevPaid + amount);
      setNewPayment('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Authentication error.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.updateStudentFees(user.token, student.student_id, totalFees, feesPaid);
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
        <form onSubmit={handleSave}>
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
                Manage Fees for {student.name}
              </h3>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
            </div>
            
            <div className="p-6 space-y-6">
                <div>
                    <label htmlFor="totalFees" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Annual Fees (₹)</label>
                    <input
                      type="number"
                      id="totalFees"
                      value={totalFees}
                      onChange={(e) => setTotalFees(Number(e.target.value))}
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Paid (₹)</p>
                        <p className="mt-1 text-lg font-semibold text-green-600 dark:text-green-400">₹{feesPaid.toLocaleString()}</p>
                    </div>
                     <div className="text-right">
                        <p className="block text-sm font-medium text-gray-700 dark:text-gray-300">Balance Due (₹)</p>
                        <p className={`mt-1 text-lg font-semibold ${totalFees - feesPaid > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            ₹{(totalFees - feesPaid).toLocaleString()}
                        </p>
                    </div>
                </div>


                <div className="border-t dark:border-gray-700 pt-6">
                     <p className="block text-sm font-medium text-gray-700 dark:text-gray-300">Record a New Payment Installment</p>
                     <div className="mt-2 flex items-center space-x-2">
                        <div className="relative flex-grow">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">₹</div>
                            <input
                              type="number"
                              value={newPayment}
                              onChange={(e) => setNewPayment(e.target.value)}
                              placeholder="Enter amount"
                              className="block w-full pl-7 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                            />
                        </div>
                         <button
                            type="button"
                            onClick={handleRecordPayment}
                            className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-md shadow-sm hover:bg-secondary-hover"
                         >
                            Add
                         </button>
                     </div>
                </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
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

export default RecordPaymentModal;