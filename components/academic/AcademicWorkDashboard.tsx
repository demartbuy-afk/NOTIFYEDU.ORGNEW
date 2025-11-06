import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Student, School, UserType, Announcement, AttendanceLog, AcademicWork, Teacher } from '../../types';
import Header from '../common/Header';
import AttendanceManager from '../school/AttendanceManager';
import FeesManager from '../school/FeesManager';
import ComplaintsManager from '../school/ComplaintsManager';
import ExamResultsManager from '../school/ExamResultsManager';
import AcademicMobileMenu from './AcademicMobileMenu';
import ClassSettingsManager from '../school/ClassSettingsManager';
import QrScannerModal from '../school/QrScanner';
import { notificationService } from '../../services/notificationService';
import AddStudentModal from '../school/AddStudentModal';

type AcademicTab = 'attendance' | 'fees' | 'examResults' | 'complaints' | 'announcements' | 'classSettings';

const AcademicWorkDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<AcademicTab>('attendance');
    const [isMenuOpen, setMenuOpen] = useState(false);
    
    // Data states
    const [students, setStudents] = useState<Student[]>([]);
    const [school, setSchool] = useState<School | null>(null);
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string>('');

    // Modal and form states
    const [isQrScannerOpen, setQrScannerOpen] = useState(false);
    const [isAddStudentModalOpen, setAddStudentModalOpen] = useState(false);
    const [announcementLoading, setAnnouncementLoading] = useState(false);
    const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
    const [newAnnouncementContent, setNewAnnouncementContent] = useState('');

    const academicUser = user as AcademicWork;

    const showToast = useCallback((message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    }, []);

    const fetchDataForTab = useCallback(async (tab: AcademicTab) => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            // Fetch common data on first load
            if (students.length === 0 || !school) {
                const [studentData, schoolData] = await Promise.all([
                    api.getSchoolStudents(academicUser.school_id, user.token),
                    api.getSchoolById(academicUser.school_id, user.token)
                ]);
                setStudents(studentData);
                setSchool(schoolData);
            }

            // Fetch tab-specific data
            switch (tab) {
                case 'attendance':
                    setLogs(await api.getTodaysAttendance(academicUser.school_id, user.token));
                    break;
                case 'classSettings':
                    if (teachers.length === 0) {
                        setTeachers(await api.getSchoolTeachers(academicUser.school_id, user.token));
                    }
                    break;
                case 'announcements':
                    setAnnouncements(await api.getAnnouncementsForSchool(academicUser.school_id, user.token));
                    break;
                // Other tabs reuse the main student list, so no extra fetching needed here
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, [user, academicUser.school_id, students.length, school, teachers.length]);


    useEffect(() => {
        fetchDataForTab(activeTab);
    }, [activeTab, fetchDataForTab]);
    
    const handleAttendanceMarked = (newLog: AttendanceLog) => {
        setLogs(prevLogs => [newLog, ...prevLogs.filter(l => l.entity_id !== newLog.entity_id)]);
        showToast(`Attendance marked for ${newLog.entity_name}.`);
    };

    const handleStudentAdded = (newStudent: Student) => {
        setStudents(prev => [...prev, newStudent]);
        showToast(`Student ${newStudent.name} added successfully.`);
    };

    const handleTabChange = (tab: AcademicTab) => {
        setActiveTab(tab);
        setMenuOpen(false);
    };
    
    const handlePostAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newAnnouncementTitle.trim() || !newAnnouncementContent.trim()) return;

        setAnnouncementLoading(true);
        try {
            const newAnnouncement = await api.createAnnouncement(academicUser.school_id, user.token, newAnnouncementTitle, newAnnouncementContent);
            setAnnouncements(prev => [newAnnouncement, ...prev]);
            setNewAnnouncementTitle('');
            setNewAnnouncementContent('');
            showToast('Announcement posted successfully.');
        } catch(err) {
            showToast(`Error: ${(err as Error).message}`);
        } finally {
            setAnnouncementLoading(false);
        }
    };
  
    const handleDeleteAnnouncement = async (announcementId: string) => {
        if (!user) return;
        const originalAnnouncements = [...announcements];
        setAnnouncements(prev => prev.filter(a => a.announcement_id !== announcementId));

        try {
            await api.deleteAnnouncement(user.token, announcementId);
            showToast('Announcement deleted.');
        } catch (err) {
            showToast('Failed to delete announcement.');
            setAnnouncements(originalAnnouncements); // Revert on failure
        }
    };


    const menuItems: { id: AcademicTab; title: string; icon: React.ReactNode }[] = [
        { id: 'attendance', title: 'Attendance', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { id: 'fees', title: 'Fees', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
        { id: 'examResults', title: 'Exam Results', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
        { id: 'classSettings', title: 'Class Settings', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { id: 'complaints', title: 'Complaints', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
        { id: 'announcements', title: 'Announcements', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514C18.378 1.965 19 2.632 19 3.437v10.126c0 .806-.622 1.472-1.436 1.136-1.147-.394-2.293-.788-3.44-1.182" /></svg> },
    ];


    const renderContent = () => {
        if (loading && students.length === 0) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
        if (error) return <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>;
        if (!school) return <p className="text-center text-gray-500">Loading school data...</p>;

        switch (activeTab) {
            case 'attendance':
                return <AttendanceManager students={students} logs={logs} onAttendanceMarked={handleAttendanceMarked} showToast={showToast} school={school} />;
            case 'fees':
                return <FeesManager students={students} onUpdateStudents={() => fetchDataForTab('fees')} showToast={showToast} school={school} onUpdateSchool={()=>{}} />;
            case 'examResults':
                return <ExamResultsManager students={students} showToast={showToast} schoolId={academicUser.school_id} />;
            case 'complaints':
                return <ComplaintsManager schoolId={academicUser.school_id} />;
            case 'announcements':
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-neutral dark:text-gray-200 mb-4">Post an Announcement</h2>
                        <form onSubmit={handlePostAnnouncement} className="mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
                            <div>
                                <label htmlFor="announcementTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                                <input id="announcementTitle" type="text" value={newAnnouncementTitle} onChange={e => setNewAnnouncementTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="announcementContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                                <textarea id="announcementContent" rows={4} value={newAnnouncementContent} onChange={e => setNewAnnouncementContent(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"></textarea>
                            </div>
                            <div className="text-right">
                                <button type="submit" disabled={announcementLoading} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none disabled:bg-gray-400">
                                    {announcementLoading ? 'Posting...' : 'Post Announcement'}
                                </button>
                            </div>
                        </form>

                        <h3 className="text-xl font-bold text-neutral dark:text-gray-200 mb-4">Posted Announcements</h3>
                        <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                            {announcements.map(ann => (
                                <div key={ann.announcement_id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-lg text-neutral dark:text-gray-200">{ann.title}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(ann.timestamp).toLocaleString()}</p>
                                        </div>
                                        <button onClick={() => handleDeleteAnnouncement(ann.announcement_id)} className="text-gray-400 hover:text-red-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ann.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'classSettings':
                return <ClassSettingsManager teachers={teachers} schoolId={academicUser.school_id} showToast={showToast} />;
            default:
                return null;
        }
    };

    if (!user || user.type !== UserType.AcademicWork) return null;

    return (
        <>
            <Header />
            <AcademicMobileMenu 
                isOpen={isMenuOpen}
                onClose={() => setMenuOpen(false)}
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                menuItems={menuItems}
            />
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-neutral dark:text-gray-200">Academic Dashboard</h2>
                     <div className="flex items-center gap-4">
                        {activeTab === 'attendance' && (
                            <button 
                                onClick={() => setAddStudentModalOpen(true)} 
                                className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75"
                            >
                                + Add Student
                            </button>
                        )}
                        <button 
                            onClick={() => setMenuOpen(true)}
                            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Open menu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    {renderContent()}
                </div>
            </main>

            <button 
                onClick={() => setQrScannerOpen(true)}
                className="fixed bottom-6 right-6 bg-secondary text-white p-4 rounded-full shadow-lg hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-75 transition-transform transform hover:scale-110"
                aria-label="Scan QR Code"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6.5 6.5v-1m-6.5-5.5h-2m14 0h2M12 20.5v-1M4.5 12h-2M7 7H5.5v1.5M17 7h1.5v1.5M7 17H5.5V15.5M17 17h1.5V15.5" /></svg>
            </button>

            {isQrScannerOpen && (
                <QrScannerModal 
                    isOpen={isQrScannerOpen}
                    onClose={() => setQrScannerOpen(false)}
                    onSuccess={handleAttendanceMarked}
                    schoolId={academicUser.school_id}
                />
            )}
            
            {isAddStudentModalOpen && user && (
                <AddStudentModal
                    isOpen={isAddStudentModalOpen}
                    onClose={() => setAddStudentModalOpen(false)}
                    schoolId={academicUser.school_id}
                    token={user.token}
                    onStudentAdded={handleStudentAdded}
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

export default AcademicWorkDashboard;