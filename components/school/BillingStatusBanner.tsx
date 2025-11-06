import React from 'react';

interface BillingStatusBannerProps {
  expiryDate?: string;
}

const BillingStatusBanner: React.FC<BillingStatusBannerProps> = ({ expiryDate }) => {
    if (!expiryDate) {
        return null;
    }

    const now = new Date();
    const expiry = new Date(expiryDate);
    // Set time to the end of the day for comparison
    expiry.setHours(23, 59, 59, 999);

    const timeDiff = expiry.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const isExpired = daysRemaining <= 0;
    const isWarning = daysRemaining > 0 && daysRemaining <= 7;

    if (!isExpired && !isWarning) {
        return null; // Don't show banner if there's more than a week left
    }

    const config = {
        warning: {
            bgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
            borderColor: 'border-yellow-500',
            textColor: 'text-yellow-800 dark:text-yellow-200',
            title: 'Subscription Expiring Soon'
        },
        expired: {
            bgColor: 'bg-red-100 dark:bg-red-900/50',
            borderColor: 'border-red-500',
            textColor: 'text-red-800 dark:text-red-200',
            title: 'Subscription Expired'
        }
    };

    const currentConfig = isExpired ? config.expired : config.warning;

    const message = isExpired 
        ? `Your subscription expired ${Math.abs(daysRemaining)} day(s) ago. Please renew to avoid account suspension.`
        : `Your subscription expires in ${daysRemaining} day(s). Please renew to ensure uninterrupted service.`

    return (
        <div className={`${currentConfig.bgColor} border-l-4 ${currentConfig.borderColor} ${currentConfig.textColor} p-4 rounded-r-lg flex justify-between items-center flex-wrap gap-4`} role="alert">
            <div>
                <p className="font-bold">{currentConfig.title}</p>
                <p className="text-sm">{message}</p>
            </div>
            <div className="text-right">
                <p className="text-sm font-medium">Expires on:</p>
                <p className="font-bold text-lg">{expiry.toLocaleDateString()}</p>
            </div>
        </div>
    );
};

export default BillingStatusBanner;