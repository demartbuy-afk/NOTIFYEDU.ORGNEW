import React from 'react';
import { Student } from '../../types';

interface FeeStatusCardProps {
  student: Student;
  onPayNow: () => void;
}

const FeeStatusCard: React.FC<FeeStatusCardProps> = ({ student, onPayNow }) => {
  const totalFees = student.total_fees ?? 0;
  const feesPaid = student.fees_paid ?? 0;
  const balance = totalFees - feesPaid;
  const percentagePaid = totalFees > 0 ? Math.round((feesPaid / totalFees) * 100) : (feesPaid > 0 ? 100 : 0);

  const getStatusInfo = () => {
    if (totalFees <= 0) {
      return { text: 'N/A', color: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200' };
    }
    if (balance <= 0) {
      return { text: 'Fully Paid', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    }
    if (feesPaid === 0) {
      return { text: 'Unpaid', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
    }
    return { text: 'Partially Paid', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
            <h2 className="text-2xl font-bold text-neutral dark:text-gray-200">Fee Status</h2>
            <span className={`mt-1 px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
        </div>
        {balance > 0 && (
            <button onClick={onPayNow} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary-hover">
                Pay Now
            </button>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Progress</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{percentagePaid}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
                className="bg-secondary h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${percentagePaid}%` }}
                role="progressbar"
                aria-valuenow={percentagePaid}
                aria-valuemin={0}
                aria-valuemax={100}
            ></div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-3 gap-4 text-center border-t dark:border-gray-700 pt-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Fees</p>
            <p className="text-lg font-semibold text-neutral dark:text-gray-200">₹{totalFees.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Paid</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">₹{feesPaid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
            <p className={`text-lg font-semibold ${balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
              ₹{balance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeStatusCard;
