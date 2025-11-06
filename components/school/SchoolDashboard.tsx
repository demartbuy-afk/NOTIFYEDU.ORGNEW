import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Student, School, UserType, Announcement, AttendanceLog, Guard, Teacher, Bus, AcademicWork } from '../../types';
import Header from '../common/Header';
import StudentList from './StudentList';
import AddStudentModal from './AddStudentModal';
import ViewStudentQrModal from './ViewStudentQrModal';
import SendMessageModal from './SendMessageModal';
import DeleteStudentModal from './DeleteStudentModal';
import AttendanceManager from './AttendanceManager';
import FeesManager from './FeesManager';
import ComplaintsManager from './ComplaintsManager';
import BillingStatusBanner from './BillingStatusBanner';
import LockedAccountView from './LockedAccountView';
import SubscriptionManager from './SubscriptionManager';
import SettingsManager from './SettingsManager';
import { notificationService } from '../../services/notificationService';
import AttendanceHistoryModal from './AttendanceHistoryModal';
import QrScannerModal from './QrScanner';
import MobileMenu from './MobileMenu';
import GuardManager from './GuardManager';
import AddGuardModal from './AddGuardModal';
import TeacherManager from './TeacherManager';
import AddTeacherModal from './AddTeacherModal';
import ClassSettingsManager from './ClassSettingsManager';
import BusManager from './BusManager';
import AddBusModal from './AddBusModal';
import ExamResultsManager from './ExamResultsManager';
import AcademicWorkManager from './AcademicWorkManager';
import AddAcademicWorkModal from './AddAcademicWorkModal';

type SchoolTab = 'students' | 'teachers' | 'academicWork' | 'guards' | 'buses' | 'attendance' | 'fees' | 'complaints' | 'announcements' | 'subscription' | 'settings' | 'classSettings' | 'examResults';

const SchoolDashboard: React.FC = () => {
  const { user, login } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [academicWorks, setAcademicWorks] = useState<AcademicWork[]>([]);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SchoolTab>('students');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isMenuOpen, setMenuOpen] = useState(false);

  const [isAddStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [isAddGuardModalOpen, setAddGuardModalOpen] = useState(false);
  const [isAddBusModalOpen, setAddBusModalOpen] = useState(false);
  const [isAddTeacherModalOpen, setAddTeacherModalOpen] = useState(false);
  const [isAddAcademicWorkModalOpen, setAddAcademicWorkModalOpen] = useState(false);
  const [viewingQrStudent, setViewingQrStudent] = useState<Student | null>(null);
  const [messagingStudent, setMessagingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [viewingHistoryStudent, setViewingHistoryStudent] = useState<Student | null>(null);
  const [isQrScannerOpen, setQrScannerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');

  const schoolUser = user as School;

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  }, []);

  const handleTabChange = (tab: SchoolTab) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  const fetchStudents = useCallback(async () => {
    if (user) {
      setLoading(true);
      setError(null);
      try {
        const studentData = await api.getSchoolStudents(user.id, user.token);
        setStudents(studentData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);
  
  const fetchGuards = useCallback(async () => {
    if (user) {
        setLoading(true);
        setError(null);
        try {
            const guardData = await api.getSchoolGuards(user.id, user.token);
            setGuards(guardData);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }
  }, [user]);

  const fetchBuses = useCallback(async () => {
    if (user) {
        setLoading(true);
        setError(null);
        try {
            const busData = await api.getSchoolBuses(user.id, user.token);
            setBuses(busData);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }
  }, [user]);
  
  const fetchTeachers = useCallback(async () => {
    if (user) {
      setLoading(true);
      setError(null);
      try {
        const teacherData = await api.getSchoolTeachers(user.id, user.token);
        setTeachers(teacherData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);
  
  const fetchAcademicWorks = useCallback(async () => {
    if (user) {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getSchoolAcademicWorks(user.id, user.token);
        setAcademicWorks(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  const fetchAnnouncements = useCallback(async () => {
    if(user) {
        setAnnouncementLoading(true);
        try {
            const announcementData = await api.getAnnouncementsForSchool(user.id, user.token);
            setAnnouncements(announcementData);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setAnnouncementLoading(false);
        }
    }
  }, [user]);
  
  const fetchLogs = useCallback(async () => {
    if (user) {
      try {
        const attendanceLogs = await api.getTodaysAttendance(user.id, user.token);
        setLogs(attendanceLogs);
      } catch (err) {
        setError((err as Error).message);
      }
    }
  }, [user]);

  useEffect(() => {
    if (['students', 'attendance', 'fees', 'examResults'].includes(activeTab)) {
        fetchStudents();
    }
    if (activeTab === 'guards') {
        fetchGuards();
    }
    if (activeTab === 'buses') {
        fetchBuses();
    }
    if (activeTab === 'academicWork') {
        fetchAcademicWorks();
    }
    if (activeTab === 'teachers' || activeTab === 'classSettings') {
      fetchTeachers();
    }
    if (activeTab === 'attendance') {
        fetchLogs();
    }
    if (activeTab === 'announcements') {
        fetchAnnouncements();
    }
  }, [activeTab, fetchStudents, fetchGuards, fetchBuses, fetchTeachers, fetchAnnouncements, fetchLogs, fetchAcademicWorks]);

  useEffect(() => {
    // On component mount, if permission has not been asked, request it.
    if ('Notification' in window && Notification.permission === 'default') {
        notificationService.requestPermission();
    }
  }, []);
  
  const handleStudentAdded = (newStudent: Student) => {
    setStudents(prev => [...prev, newStudent]);
    // The modal flow continues, but we add to the list instantly.
  };

  const handleGuardAdded = (newGuard: Guard) => {
      setGuards(prev => [...prev, newGuard]);
  };
  
  const handleBusAdded = (newBus: Bus) => {
    setBuses(prev => [...prev, newBus]);
  };

  const handleTeacherAdded = (newTeacher: Teacher) => {
    setTeachers(prev => [...prev, newTeacher]);
  };

  const handleAcademicWorkAdded = (newAcademicWork: AcademicWork) => {
    setAcademicWorks(prev => [...prev, newAcademicWork]);
  };

  const handleStudentDeleted = () => {
      if (!deletingStudent) return;
      showToast(`Student ${deletingStudent.name} deleted successfully.`);
      setStudents(prev => prev.filter(s => s.student_id !== deletingStudent.student_id));
      setDeletingStudent(null);
  };
  
  const handleAttendanceMarked = (newLog: AttendanceLog) => {
    // Add new log and remove any previous logs for that student today to reflect the latest status.
    setLogs(prevLogs => [newLog, ...prevLogs.filter(l => l.entity_id !== newLog.entity_id)]);
    const studentName = newLog.entity_name || students.find(s => s.student_id === newLog.entity_id)?.name;
    showToast(`Attendance marked for ${studentName}.`);
    notificationService.show('Attendance Recorded', {
        body: `${studentName} was marked as ${newLog.status} via ${newLog.mode} entry.`
    }, 'attendance');
  };

  const handleSubscriptionUpdated = (updatedSchool: School) => {
    // Re-login with updated user data to refresh context and local storage
    login(updatedSchool);
    showToast('Subscription updated successfully!');
  };

  const handleSettingsUpdated = (updatedSchool: School) => {
    login(updatedSchool);
    showToast('Settings updated successfully!');
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newAnnouncementTitle.trim() || !newAnnouncementContent.trim()) return;

    setAnnouncementLoading(true);
    try {
        const newAnnouncement = await api.createAnnouncement(user.id, user.token, newAnnouncementTitle, newAnnouncementContent);
        setAnnouncements(prev => [newAnnouncement, ...prev]);
        setNewAnnouncementTitle('');
        setNewAnnouncementContent('');
        showToast('Announcement posted successfully.');
        notificationService.show('Announcement Posted', {
            body: `Your new announcement "${newAnnouncement.title}" is now live for students and parents.`
        }, 'announcement');
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

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.roll_no.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || user.type !== UserType.School) {
    return null; // Or a redirect component
  }
  
  if (user.status === 'LOCKED') {
      return (
          <>
              <Header />
              <LockedAccountView onRenew={() => handleTabChange('subscription')} />
          </>
      );
  }

  const renderContent = () => {
    if (loading && !['subscription', 'announcements', 'settings'].includes(activeTab)) {
      return (
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }
    if (error && activeTab !== 'announcements') { // Let announcements tab handle its own error display
      return <div className="text-center text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-200 p-4 rounded-lg">{error}</div>;
    }

    switch (activeTab) {
      case 'students':
        return (
            <div>
                <div className="mb-4">
                    <label htmlFor="studentSearch" className="sr-only">Search Students</label>
                    <input
                        id="studentSearch"
                        type="text"
                        placeholder="Search by name or roll no..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full max-w-md px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                    />
                </div>
                <StudentList 
                    students={filteredStudents} 
                    onViewQr={setViewingQrStudent} 
                    onSendMessage={setMessagingStudent}
                    onDelete={setDeletingStudent}
                    onViewHistory={setViewingHistoryStudent}
                    searchQuery={searchQuery}
                />
            </div>
        );
      case 'teachers':
        return <TeacherManager teachers={teachers} />;
      case 'guards':
        return <GuardManager guards={guards} />;
      case 'buses':
        return <BusManager buses={buses} />;
      case 'academicWork':
        return <AcademicWorkManager academicWorks={academicWorks} />;
      case 'attendance':
        return <AttendanceManager students={students} logs={logs} onAttendanceMarked={handleAttendanceMarked} showToast={showToast} school={schoolUser} />;
      case 'fees':
        return <FeesManager students={students} onUpdateStudents={fetchStudents} onUpdateSchool={handleSettingsUpdated} showToast={showToast} school={schoolUser} />;
      case 'complaints':
        return <ComplaintsManager schoolId={user.id} />;
      case 'announcements':
        return (
            <div>
                <h2 className="text-2xl font-bold text-neutral dark:text-gray-200 mb-4">Post an Announcement</h2>
                <form onSubmit={handlePostAnnouncement} className="mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
                    <div>
                        <label htmlFor="announcementTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                        <input id="announcementTitle" type="text" value={newAnnouncementTitle} onChange={e => setNewAnnouncementTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label htmlFor="announcementContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                        <textarea id="announcementContent" rows={4} value={newAnnouncementContent} onChange={e => setNewAnnouncementContent(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"></textarea>
                    </div>
                    <div className="text-right">
                        <button type="submit" disabled={announcementLoading} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75 disabled:bg-gray-400">
                            {announcementLoading ? 'Posting...' : 'Post Announcement'}
                        </button>
                    </div>
                </form>

                <h3 className="text-xl font-bold text-neutral dark:text-gray-200 mb-4">Posted Announcements</h3>
                {announcementLoading && announcements.length === 0 ? <p>Loading...</p> : null}
                {announcements.length === 0 && !announcementLoading ? <p className="text-gray-500">No announcements posted yet.</p> : null}
                <div className="space-y-4">
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
      case 'subscription':
        return <SubscriptionManager 
                  school={schoolUser}
                  onSubscriptionUpdate={handleSubscriptionUpdated}
                  showToast={showToast} 
                />;
      case 'settings':
        return <SettingsManager school={schoolUser} onUpdate={handleSettingsUpdated} showToast={showToast} />;
      case 'classSettings':
        return <ClassSettingsManager teachers={teachers} schoolId={schoolUser.id} showToast={showToast} />;
      case 'examResults':
        return <ExamResultsManager students={students} showToast={showToast} schoolId={user.id} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <BillingStatusBanner expiryDate={schoolUser.subscription_expiry_date} />
        
        <div className="flex justify-between items-center mt-6">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setMenuOpen(true)}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Open menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <h2 className="text-3xl font-bold text-neutral dark:text-gray-200">School Dashboard</h2>
            </div>
            {activeTab === 'students' && (
                <button onClick={() => setAddStudentModalOpen(true)} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75">
                    + Add Student
                </button>
            )}
            {activeTab === 'teachers' && (
                <button onClick={() => setAddTeacherModalOpen(true)} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75">
                    + Add Teacher
                </button>
            )}
             {activeTab === 'academicWork' && (
                <button onClick={() => setAddAcademicWorkModalOpen(true)} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75">
                    + Add Academic Staff
                </button>
            )}
            {activeTab === 'guards' && (
                <button onClick={() => setAddGuardModalOpen(true)} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75">
                    + Add Guard
                </button>
            )}
            {activeTab === 'buses' && (
                <button onClick={() => setAddBusModalOpen(true)} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75">
                    + Add Bus Staff
                </button>
            )}
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            {renderContent()}
        </div>
      </main>

      {isAddStudentModalOpen && user && (
        <AddStudentModal
          isOpen={isAddStudentModalOpen}
          onClose={() => setAddStudentModalOpen(false)}
          schoolId={user.id}
          token={user.token}
          onStudentAdded={handleStudentAdded}
        />
      )}
      {isAddGuardModalOpen && user && (
        <AddGuardModal
          isOpen={isAddGuardModalOpen}
          onClose={() => setAddGuardModalOpen(false)}
          schoolId={user.id}
          token={user.token}
          onGuardAdded={handleGuardAdded}
        />
      )}
       {isAddAcademicWorkModalOpen && user && (
        <AddAcademicWorkModal
          isOpen={isAddAcademicWorkModalOpen}
          onClose={() => setAddAcademicWorkModalOpen(false)}
          schoolId={user.id}
          token={user.token}
          onAcademicWorkAdded={handleAcademicWorkAdded}
        />
      )}
      {isAddBusModalOpen && user && (
        <AddBusModal
          isOpen={isAddBusModalOpen}
          onClose={() => setAddBusModalOpen(false)}
          schoolId={user.id}
          token={user.token}
          onBusAdded={handleBusAdded}
        />
      )}
      {isAddTeacherModalOpen && user && (
        <AddTeacherModal
          isOpen={isAddTeacherModalOpen}
          onClose={() => setAddTeacherModalOpen(false)}
          schoolId={user.id}
          token={user.token}
          onTeacherAdded={handleTeacherAdded}
        />
      )}
      {viewingQrStudent && (
        <ViewStudentQrModal 
            isOpen={!!viewingQrStudent}
            onClose={() => setViewingQrStudent(null)}
            student={viewingQrStudent}
        />
      )}
      {messagingStudent && user && (
          <SendMessageModal 
            isOpen={!!messagingStudent}
            onClose={() => setMessagingStudent(null)}
            student={messagingStudent}
            token={user.token}
            onSuccess={() => {
                const studentName = messagingStudent.name;
                showToast(`Message sent to ${studentName}'s parent.`);
                notificationService.show('Message Sent', {
                  body: `Your message to ${studentName}'s parent has been sent.`
                }, 'message');
                setMessagingStudent(null);
            }}
          />
      )}
      {deletingStudent && user && (
        <DeleteStudentModal
          isOpen={!!deletingStudent}
          onClose={() => setDeletingStudent(null)}
          student={deletingStudent}
          token={user.token}
          onSuccess={handleStudentDeleted}
        />
      )}
      {viewingHistoryStudent && (
        <AttendanceHistoryModal
          isOpen={!!viewingHistoryStudent}
          onClose={() => setViewingHistoryStudent(null)}
          student={viewingHistoryStudent}
        />
      )}

      {/* Floating Action Button for QR Scanner */}
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
            schoolId={schoolUser.id}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg animate-bounce z-[100]">
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default SchoolDashboard;