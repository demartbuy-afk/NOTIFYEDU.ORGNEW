import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ContactInfo } from '../../types';

interface SubscriptionContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionContactModal: React.FC<SubscriptionContactModalProps> = ({ isOpen, onClose }) => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchInfo = async () => {
        setLoading(true);
        try {
          const data = await api.getContactInfo();
          setContactInfo(data);
        } catch (e) {
          console.error("Failed to fetch contact info for modal", e);
        } finally {
          setLoading(false);
        }
      };
      fetchInfo();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
            Renew Your Subscription
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
        </div>
        
        <div className="p-6 text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
                To renew or upgrade your subscription, please contact our sales team. We'll be happy to assist you with the process.
            </p>
            {loading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            ) : contactInfo ? (
                <div className="text-left bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2 text-gray-800 dark:text-gray-200">
                    <p><strong>Email:</strong> <a href={`mailto:${contactInfo.email}`} className="text-primary hover:underline">{contactInfo.email}</a></p>
                    <p><strong>Phone:</strong> <a href={`tel:${contactInfo.phone}`} className="text-primary hover:underline">{contactInfo.phone}</a></p>
                </div>
            ) : (
                <p className="text-red-500">Could not load contact information.</p>
            )}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover"
            >
              Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionContactModal;