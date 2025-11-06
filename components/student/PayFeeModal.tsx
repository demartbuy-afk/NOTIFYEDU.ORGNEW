import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Student, School } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface PayFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onSuccess: () => void;
}

const PayFeeModal: React.FC<PayFeeModalProps> = ({ isOpen, onClose, student, onSuccess }) => {
  const { user } = useAuth();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState('');
  const [payerName, setPayerName] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      const fetchSchoolInfo = async () => {
        setLoading(true);
        setError(null);
        try {
          const schoolData = await api.getSchoolById(student.school_id, user.token);
          setSchool(schoolData);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      };
      fetchSchoolInfo();
    }
  }, [isOpen, user, student.school_id]);

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !payerName || !transactionId) {
        setError("Please fill all fields to submit proof.");
        return;
    }
    setSubmitting(true);
    setError(null);
    try {
        await api.submitPaymentProof(user.token, student.student_id, {
            amount: parseFloat(amount),
            payer_name: payerName,
            transaction_id: transactionId,
        });
        onSuccess();
    } catch (err) {
        setError((err as Error).message);
    } finally {
        setSubmitting(false);
    }
  };

  if (!isOpen) return null;
  
  const balance = (student.total_fees || 0) - (student.fees_paid || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">Pay School Fees</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
          ) : error ? (
            <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* QR Code Section */}
              <div className="text-center">
                <h4 className="font-semibold text-neutral dark:text-gray-200">1. Scan & Pay</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Use any UPI app to pay.</p>
                <div className="p-2 bg-white rounded-lg inline-block">
                  {school?.payment_qr_code_base64 ? (
                    <img src={`data:image/png;base64,${school.payment_qr_code_base64}`} alt="School Payment QR Code" className="w-48 h-48" />
                  ) : (
                    <div className="w-48 h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-center text-sm text-gray-500 p-4">
                      The school has not set up online payments yet.
                    </div>
                  )}
                </div>
                 <p className="text-lg font-bold text-neutral dark:text-gray-200 mt-2">Balance Due: ₹{balance.toLocaleString()}</p>
              </div>

              {/* Form Section */}
              <form onSubmit={handleSubmitProof} className="space-y-4">
                <h4 className="font-semibold text-neutral dark:text-gray-200">2. Submit Proof</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 -mt-3">After paying, fill in the details below.</p>
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount Paid (₹)</label>
                  <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                </div>
                <div>
                  <label htmlFor="payerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Name (as in bank)</label>
                  <input type="text" id="payerName" value={payerName} onChange={e => setPayerName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                </div>
                <div>
                  <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Transaction ID / UPI Ref No.</label>
                  <input type="text" id="transactionId" value={transactionId} onChange={e => setTransactionId(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                </div>
                 <button type="submit" disabled={submitting || !school?.payment_qr_code_base64} className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover disabled:bg-gray-400">
                  {submitting ? 'Submitting...' : 'Submit Proof'}
                </button>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayFeeModal;
