import React, { useState, useEffect, useCallback } from 'react';
import { useAuth, } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Student, StudentAnalytics, UserType, AttendanceLog, AttendanceStatus } from '../../types';
import Header from '../common/Header';
import AnalyticsCard from './AnalyticsCard';
import RecentAttendance from './RecentAttendance';
import ComplaintBox from './ComplaintBox';
import FeeStatusCard from './FeeStatusCard';
import MessageBoard from './MessageBoard';
import { pushService } from '../../services/pushService';
import DownloadStudentReportModal from './DownloadStudentReportModal';
import { downloadCSV } from '../../utils/csv';
import ClassRoutineViewer from './ClassRoutineViewer';
import PayFeeModal from './PayFeeModal';
import { notificationService } from '../../services/notificationService';
import ExamResultViewer from './ExamResultViewer';
import MobileMenu, { StudentTab, menuItems } from './MobileMenu';


const StudentDashboard: React.FC = () => {
    const { user, login } = useAuth();
    const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
    const [isPayFeeModalOpen, setIsPayFeeModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string>('');

    const [activeTab, setActiveTab] = useState<StudentTab>('dashboard');
    const [isMenuOpen, setMenuOpen] = useState(false);

    const studentUser = user as Student;
    
    const showToast = useCallback((message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    }, []);

    const fetchData = useCallback(async () => {
        if (user?.id && user?.token) {
            setLoading(true);
            setError(null);
            try {
                const [analyticsData, freshStudentData] = await Promise.all([
                    api.getStudentAnalytics(user.id, user.token),
                    api.getStudentById(user.id, user.token)
                ]);
                setAnalytics(analyticsData);
                login(freshStudentData);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }
    }, [user?.id, user?.token, login]);

    useEffect(() => {
        fetchData();
        // Ask for push notification permission on load
        if (user) {
          pushService.subscribeUser(user.id);
        }
    }, [fetchData]);

    // Listen for attendance notifications from other tabs (e.g., school dashboard)
    useEffect(() => {
        const channel = new BroadcastChannel('notifyedu_attendance');
        const handleMessage = (event: MessageEvent) => {
            const { type, studentId, log } = event.data;
            if (type === 'ATTENDANCE_UPDATE' && studentId === user?.id) {
                notificationService.show(
                    'Attendance Update', 
                    { body: `Your attendance was just marked as ${log.status}.` },
                    'attendance'
                );
                
                // Optimistically update UI
                setAnalytics(prev => {
                    if (!prev) return null;
                    // Prepend new log and ensure it's unique
                    const existingLogs = prev.recent_logs.filter(l => l.log_id !== log.log_id);
                    const newLogs = [log, ...existingLogs].slice(0, 5);

                    return {
                        ...prev,
                        recent_logs: newLogs,
                        last_entry: log.status === AttendanceStatus.IN ? log.timestamp : prev.last_entry,
                        last_exit: log.status === AttendanceStatus.OUT ? log.timestamp : prev.last_exit,
                    };
                });
                showToast(`Attendance updated: ${log.status}`);
            }
        };

        channel.addEventListener('message', handleMessage);

        return () => {
            channel.removeEventListener('message', handleMessage);
            channel.close();
        };
    }, [user?.id, showToast]);


    const handlePaymentSuccess = () => {
        setIsPayFeeModalOpen(false);
        showToast("Payment proof submitted successfully for verification.");
        // Fee status is not updated until school approves, so no refetch is needed here.
    };
    
    const handleDownloadReport = async () => {
        if (!user) return;
        try {
            const allLogs = await api.getStudentAttendanceHistory(user.id, user.token);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const historicalLogs = allLogs.filter(log => {
                const logDate = new Date(log.timestamp);
                logDate.setHours(0, 0, 0, 0);
                return logDate.getTime() < today.getTime();
            });
            
            if (historicalLogs.length === 0) {
                showToast("No historical attendance data found.");
                return;
            }

            const logsByDate = historicalLogs.reduce((acc, log) => {
                const dateStr = new Date(log.timestamp).toLocaleDateString();
                if (!acc[dateStr]) acc[dateStr] = [];
                acc[dateStr].push(log);
                return acc;
            }, {} as Record<string, AttendanceLog[]>);

            const headers = ['Date', 'Status', 'Bus Boarded', 'Bus De-boarded', 'School Check-in', 'School Check-out'];
            const data = Object.entries(logsByDate).map(([date, logs]) => {
                logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                
                const firstBusIn = logs.find(l => l.status === AttendanceStatus.BUS_IN);
                const lastBusOut = logs.filter(l => l.status === AttendanceStatus.BUS_OUT).pop();
                const firstIn = logs.find(l => l.status === AttendanceStatus.IN);
                const lastOut = logs.filter(l => l.status === AttendanceStatus.OUT).pop();
                const isAbsent = logs.some(l => l.status === AttendanceStatus.ABSENT);
                
                let status = 'ABSENT'; // Default if no other logs
                if (firstIn) {
                    status = 'PRESENT';
                } else if (isAbsent) {
                    status = 'ABSENT';
                }

                const format = (log?: AttendanceLog) => log ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
                
                return [date, status, format(firstBusIn), format(lastBusOut), format(firstIn), format(lastOut)];
            });

            downloadCSV(headers, data, `Attendance_Report_${user.name}.csv`);
            showToast('Report downloaded successfully!');
            
        } catch (err) {
            showToast(`Error downloading report: ${(err as Error).message}`);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <AnalyticsCard title="Days Present" value={`${analytics?.present_count || 0}`} color="green" />
                            <AnalyticsCard title="Days Absent" value={`${analytics?.absent_count || 0}`} color="red" />
                            <AnalyticsCard title="Last Entry" value={analytics?.last_entry ? new Date(analytics.last_entry).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'} color="blue" />
                            <AnalyticsCard title="Last Exit" value={analytics?.last_exit ? new Date(analytics.last_exit).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'} color="yellow" />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-bold text-neutral dark:text-gray-200 mb-4">Recent Activity</h3>
                                <RecentAttendance logs={analytics?.recent_logs || []} />
                            </div>
                            <div className="space-y-8">
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                                    <h3 className="text-xl font-bold text-neutral dark:text-gray-200 mb-4">Quick Actions</h3>
                                    <div className="space-y-3">
                                        <button 
                                            onClick={() => setDownloadModalOpen(true)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-secondary rounded-lg shadow-md hover:bg-secondary-hover">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                            Download Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'results':
                return <ExamResultViewer student={studentUser} />;
            case 'routine':
                return <ClassRoutineViewer student={studentUser} />;
            case 'fees':
                return <FeeStatusCard student={studentUser} onPayNow={() => setIsPayFeeModalOpen(true)} />;
            case 'messages':
                return <MessageBoard studentId={studentUser.id} schoolId={studentUser.school_id} token={studentUser.token} />;
            case 'complaints':
                return <ComplaintBox studentId={studentUser.id} token={studentUser.token} />;
            default:
                return null;
        }
    };

    if (!user || user.type !== UserType.Student) {
        return null; // Or a redirect
    }

    if (loading && !analytics) { // Only show full-page loader on initial load
        return (
            <>
                <Header />
                <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
                    <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-primary"></div>
                </div>
            </>
        );
    }
    
    if (error) {
        return (
            <>
                <Header />
                <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                    <div className="text-center text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-200 p-4 rounded-lg">{error}</div>
                </main>
            </>
        )
    }

    return (
        <>
            <Header />
            <MobileMenu
                isOpen={isMenuOpen}
                onClose={() => setMenuOpen(false)}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                 <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral dark:text-gray-200">Welcome, {studentUser.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400">Class: {studentUser.class} | Roll No: {studentUser.roll_no}</p>
                    </div>
                    <button 
                        onClick={() => setMenuOpen(true)}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
                        aria-label="Open menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden md:block md:col-span-1">
                        <nav className="space-y-2 sticky top-24">
                            {menuItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex items-center w-full p-3 rounded-lg text-left transition-colors ${
                                        activeTab === item.id
                                        ? 'bg-primary/10 text-primary dark:bg-primary/20 font-semibold' 
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <span className="mr-4">{item.icon}</span>
                                    {item.title}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <div className="md:col-span-3 min-w-0">
                        {loading && <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}
                        {!loading && renderContent()}
                    </div>
                </div>

            </main>
            {isDownloadModalOpen && (
                <DownloadStudentReportModal 
                    isOpen={isDownloadModalOpen}
                    onClose={() => setDownloadModalOpen(false)}
                    onDownload={handleDownloadReport}
                />
            )}
            {isPayFeeModalOpen && (
                <PayFeeModal
                    isOpen={isPayFeeModalOpen}
                    onClose={() => setIsPayFeeModalOpen(false)}
                    student={studentUser}
                    onSuccess={handlePaymentSuccess}
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

export default StudentDashboard;