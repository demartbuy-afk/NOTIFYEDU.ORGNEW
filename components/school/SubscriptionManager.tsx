// FIX: This file was a placeholder. Implemented the SubscriptionManager component.
import React, { useState } from 'react';
import { School } from '../../types';
import SubscriptionContactModal from './SubscriptionContactModal';

interface SubscriptionManagerProps {
  school: School;
  onSubscriptionUpdate: (updatedSchool: School) => void;
  showToast: (message: string) => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ school, onSubscriptionUpdate, showToast }) => {
    const [isContactModalOpen, setContactModalOpen] = useState(false);
    
    const expiryDate = new Date(school.subscription_expiry_date);
    const now = new Date();
    const isExpired = expiryDate < now;
    
    const handleRenew = () => {
        // In a real app, this would likely go to a payment gateway.
        // Here, we'll just open a contact modal.
        setContactModalOpen(true);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-neutral dark:text-gray-200 mb-4">Subscription Management</h2>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <h3 className="text-lg font-semibold text-neutral dark:text-gray-100">Current Plan</h3>
                        <p className="text-gray-600 dark:text-gray-300">NotifyEdu Pro</p>
                        <div className={`mt-4 text-sm font-semibold p-3 rounded-md ${isExpired ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                            Status: {isExpired ? 'Expired' : 'Active'}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-neutral dark:text-gray-100">Expires On</h3>
                        <p className="text-2xl font-bold text-neutral dark:text-gray-200 mt-2">{expiryDate.toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="mt-6 border-t dark:border-gray-600 pt-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {isExpired ? 'Your subscription has expired. Please renew to restore full functionality.' : 'Renew your subscription to continue enjoying our services without interruption.'}
                    </p>
                    <button 
                        onClick={handleRenew}
                        className="px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75"
                    >
                        Renew Subscription
                    </button>
                </div>
            </div>
            <SubscriptionContactModal 
                isOpen={isContactModalOpen}
                onClose={() => setContactModalOpen(false)}
            />
        </div>
    );
};

export default SubscriptionManager;