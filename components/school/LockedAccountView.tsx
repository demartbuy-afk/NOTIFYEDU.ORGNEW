import React from 'react';

interface LockedAccountViewProps {
    onRenew: () => void;
}

const LockedAccountView: React.FC<LockedAccountViewProps> = ({ onRenew }) => {
    return (
        <main className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center space-y-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-red-500 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                </svg>
                <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">Account Locked</h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Your account has been temporarily locked because your subscription has expired. Access to portal features is restricted.
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Please renew your subscription to reactivate your account and restore full access.
                </p>
                <button 
                    onClick={onRenew} 
                    className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75"
                >
                    Renew Subscription
                </button>
            </div>
        </main>
    );
};

export default LockedAccountView;