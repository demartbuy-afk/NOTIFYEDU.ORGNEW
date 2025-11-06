import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AttendanceLog } from '../../types';
import Header from '../common/Header';
import GuardQrScannerModal from './GuardQrScannerModal';
import { api } from '../../services/api';
import { notificationService } from '../../services/notificationService';

const GuardDashboard: React.FC = () => {
    const { user } = useAuth();
    const [isScannerOpen, setScannerOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string>('');
    
    // Complaint form state
    const [studentIdentifier, setStudentIdentifier] = useState('');
    const [complaintText, setComplaintText] = useState('');
    const [complaintLoading, setComplaintLoading] = useState(false);
    const [complaintError, setComplaintError] = useState<string | null>(null);
    const [complaintSuccess, setComplaintSuccess] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleScanSuccess = (log: AttendanceLog, entityName: string) => {
        setScannerOpen(false);
        showToast(`Attendance for ${entityName} marked as ${log.status}.`);
        notificationService.show('Attendance Recorded', {
            body: `${entityName} was marked as ${log.status} by Guard ${user?.name}.`
        }, 'attendance');
    };

    const handleComplaintSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !studentIdentifier.trim() || !complaintText.trim()) return;

        setComplaintLoading(true);
        setComplaintError(null);
        setComplaintSuccess(null);
        try {
            const complaint = await api.guardSubmitComplaint(user.token, studentIdentifier, complaintText);
            setComplaintSuccess(`Report submitted for student ${complaint.student_name}.`);
            setStudentIdentifier('');
            setComplaintText('');
        } catch (err) {
            setComplaintError((err as Error).message);
        } finally {
            setComplaintLoading(false);
        }
    };
    
    return (
        <>
            <Header />
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* QR Scanner Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center flex flex-col items-center justify-center">
                        <h2 className="text-2xl font-bold text-neutral dark:text-gray-200 mb-4">Mark Attendance</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Scan a student's or teacher's QR code to mark them as IN or OUT.</p>
                        <button 
                            onClick={() => setScannerOpen(true)}
                            className="px-6 py-3 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-75 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6.5 6.5v-1m-6.5-5.5h-2m14 0h2M12 20.5v-1M4.5 12h-2M7 7H5.5v1.5M17 7h1.5v1.5M7 17H5.5V15.5M17 17h1.5V15.5" /></svg>
                            Open Scanner
                        </button>
                    </div>

                    {/* Report Student Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-neutral dark:text-gray-200 mb-4">Report a Student</h2>
                        <form onSubmit={handleComplaintSubmit} className="space-y-4">
                             <div>
                                <label htmlFor="studentIdentifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Student ID or Roll No.</label>
                                <input
                                  type="text"
                                  id="studentIdentifier"
                                  value={studentIdentifier}
                                  onChange={(e) => setStudentIdentifier(e.target.value)}
                                  required
                                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div>
                                <label htmlFor="complaintText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Report Details</label>
                                <textarea
                                  id="complaintText"
                                  rows={3}
                                  value={complaintText}
                                  onChange={(e) => setComplaintText(e.target.value)}
                                  required
                                  placeholder="e.g., Student was running on the road."
                                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <button
                              type="submit"
                              disabled={complaintLoading}
                              className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75 disabled:bg-gray-400"
                            >
                              {complaintLoading ? 'Submitting...' : 'Submit Report'}
                            </button>
                            <div className="h-5 text-center text-sm">
                                {complaintError && <p className="text-red-500">{complaintError}</p>}
                                {complaintSuccess && <p className="text-green-500">{complaintSuccess}</p>}
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            
            {isScannerOpen && (
                <GuardQrScannerModal
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

export default GuardDashboard;