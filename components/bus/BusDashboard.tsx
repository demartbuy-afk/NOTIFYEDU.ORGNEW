import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AttendanceLog } from '../../types';
import Header from '../common/Header';
import BusQrScannerModal from './BusQrScannerModal';
import { notificationService } from '../../services/notificationService';

const BusDashboard: React.FC = () => {
    const { user } = useAuth();
    const [isScannerOpen, setScannerOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string>('');

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleScanSuccess = (log: AttendanceLog, entityName: string) => {
        setScannerOpen(false);
        const statusText = log.status === 'BUS_IN' ? 'boarded the vehicle' : 'de-boarded the vehicle';
        showToast(`${entityName} has ${statusText}.`);
        notificationService.show('Bus Attendance Recorded', {
            body: `${entityName} was marked as ${log.status} by ${user?.name}.`
        }, 'attendance');
    };
    
    return (
        <>
            <Header />
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[calc(100vh-64px)]">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md text-center flex flex-col items-center justify-center">
                    <h2 className="text-3xl font-bold text-neutral dark:text-gray-200 mb-4">Bus Attendance</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">Scan a student's QR code to record when they get on or off the vehicle.</p>
                    <button 
                        onClick={() => setScannerOpen(true)}
                        className="px-8 py-4 bg-secondary text-white font-semibold rounded-full shadow-lg hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-75 flex items-center gap-3 text-lg"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6.5 6.5v-1m-6.5-5.5h-2m14 0h2M12 20.5v-1M4.5 12h-2M7 7H5.5v1.5M17 7h1.5v1.5M7 17H5.5V15.5M17 17h1.5V15.5" /></svg>
                        Scan Student QR
                    </button>
                </div>
            </main>
            
            {isScannerOpen && (
                <BusQrScannerModal
                    isOpen={isScannerOpen}
                    onClose={() => setScannerOpen(false)}
                    onSuccess={handleScanSuccess}
                />
            )}
            
            {toastMessage && (
                <div className="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg animate-bounce z-[100]">
                  {toastMessage}
                </div>
            )}
        </>
    );
};

export default BusDashboard;