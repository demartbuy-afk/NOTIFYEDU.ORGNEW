import React, { useState, useMemo } from 'react';
import { Student, AttendanceLog, AttendanceStatus, School } from '../../types';
import ManualAttendance from './ManualAttendance';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import AttendanceStudentList from './AttendanceStudentList';
import DownloadReportModal from '../common/DownloadReportModal';
import { downloadCSV } from '../../utils/csv';
import StudentAnalysisModal from './StudentAnalysisModal';

// Define types for the main tabs and the inner summary tabs
type AttendanceModeTab = 'summary' | 'manual' | 'fingerprint';
type SummarySubTab = 'total' | 'present' | 'not_present';

interface AttendanceManagerProps {
  students: Student[];
  logs: AttendanceLog[];
  onAttendanceMarked: (log: AttendanceLog) => void;
  showToast: (message: string) => void;
  school: School;
}

const SummaryCard: React.FC<{ title: string; count: number; icon: string; isActive: boolean; onClick: () => void; }> = ({ title, count, icon, isActive, onClick }) => {
    const activeClasses = 'border-primary bg-primary/5 dark:bg-primary/10';
    const inactiveClasses = 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-700/50';
    return (
        <div onClick={onClick} className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${isActive ? activeClasses : inactiveClasses}`}>
            <div className="flex items-center space-x-3">
                <div className="text-2xl">{icon}</div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-neutral dark:text-gray-200">{count}</p>
                </div>
            </div>
        </div>
    );
};


const AttendanceManager: React.FC<AttendanceManagerProps> = ({ students, logs, onAttendanceMarked, showToast, school }) => {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<AttendanceModeTab>('summary');
  const [activeSummaryTab, setActiveSummaryTab] = useState<SummarySubTab>('total');
  const [isDownloadModalOpen, setDownloadModalOpen] = useState(false);
  const [isAnalysisModalOpen, setAnalysisModalOpen] = useState(false);

  // Memoized calculation for present and not-present students
  const { presentStudents, notPresentStudents } = useMemo(() => {
    const presentStudentIds = new Set(
      logs.filter(log => log.entity_type === 'student' && (log.status === AttendanceStatus.IN || log.status === AttendanceStatus.OUT || log.status === AttendanceStatus.BUS_IN || log.status === AttendanceStatus.BUS_OUT)).map(log => log.entity_id)
    );

    const present = students.filter(s => presentStudentIds.has(s.student_id));
    const notPresent = students.filter(s => !presentStudentIds.has(s.student_id));
    
    return {
        presentStudents: present,
        notPresentStudents: notPresent
    };
  }, [students, logs]);
  
  const handleMarkAllAbsent = async () => {
      if (!user || !window.confirm("Are you sure you want to mark all remaining students as absent for today?")) return;
      try {
          const count = await api.markAllAbsent(school.id, user.token);
          showToast(`${count} student(s) marked as absent.`);
          // Note: To see the change, the parent component needs to refetch logs.
      } catch (err) {
          showToast(`Error: ${(err as Error).message}`);
      }
  };

  const handleDownloadSchoolReport = async (date: string) => {
    if (!user) return;
    try {
        const logsForDate = await api.getAttendanceForDate(school.id, user.token, date);
        const headers = ['Student ID', 'Name', 'Roll No.', 'Class', 'Status', 'Check-in Time', 'Check-out Time'];
        
        const data = students.map(student => {
            const studentLogs = logsForDate
                .filter(log => log.entity_id === student.student_id)
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            let status = 'ABSENT';
            let inTime = 'N/A';
            let outTime = 'N/A';
            
            if (studentLogs.length > 0) {
                const firstIn = studentLogs.find(l => l.status === AttendanceStatus.IN);
                const lastOut = studentLogs.filter(l => l.status === AttendanceStatus.OUT).pop();
                
                if (firstIn) {
                    status = 'PRESENT';
                    inTime = new Date(firstIn.timestamp).toLocaleTimeString();
                }
                if (lastOut) {
                    outTime = new Date(lastOut.timestamp).toLocaleTimeString();
                }
                const hasPresenceLog = studentLogs.some(l => l.status === AttendanceStatus.IN || l.status === AttendanceStatus.OUT);
                if (!hasPresenceLog && studentLogs.some(l => l.status === AttendanceStatus.ABSENT)) {
                    status = 'ABSENT';
                }
            }
            
            return [student.student_id, student.name, student.roll_no, student.class, status, inTime, outTime];
        });

        downloadCSV(headers, data, `Attendance_Report_${date}.csv`);
        showToast('Report downloaded successfully!');
    } catch (err) {
        showToast(`Error: ${(err as Error).message}`);
    }
  };

  const renderSummaryContent = () => {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <SummaryCard 
                    title="Total Students" 
                    count={students.length} 
                    icon="👥" 
                    isActive={activeSummaryTab === 'total'} 
                    onClick={() => setActiveSummaryTab('total')} 
                />
                <SummaryCard 
                    title="Present Today" 
                    count={presentStudents.length} 
                    icon="✅" 
                    isActive={activeSummaryTab === 'present'} 
                    onClick={() => setActiveSummaryTab('present')} 
                />
                <SummaryCard 
                    title="Not Present" 
                    count={notPresentStudents.length} 
                    icon="❌" 
                    isActive={activeSummaryTab === 'not_present'} 
                    onClick={() => setActiveSummaryTab('not_present')} 
                />
            </div>
            <div className="flex flex-col items-stretch justify-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 gap-2">
                 <button 
                    onClick={() => setAnalysisModalOpen(true)}
                    className="w-full text-center px-3 py-1.5 text-sm font-medium text-secondary bg-secondary/10 rounded-md hover:bg-secondary/20"
                  >
                    Student Analyse
                  </button>
                 <button 
                    onClick={() => setDownloadModalOpen(true)}
                    className="w-full text-center px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20"
                  >
                    Download Report
                  </button>
            </div>
        </div>
        <div className="mt-6">
            {activeSummaryTab === 'total' && <AttendanceStudentList students={students} logs={logs} />}
            {activeSummaryTab === 'present' && <AttendanceStudentList students={presentStudents} logs={logs} />}
            {activeSummaryTab === 'not_present' && (
                <div>
                    <AttendanceStudentList students={notPresentStudents} logs={logs} />
                    {notPresentStudents.length > 0 && (
                        <div className="text-center pt-6 mt-6 border-t dark:border-gray-700">
                            <button 
                                onClick={handleMarkAllAbsent}
                                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition transform hover:scale-105"
                            >
                                Mark All as Absent
                            </button>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Use this action to mark all students in this list as absent for today.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeMode) {
      case 'summary':
        return renderSummaryContent();
      case 'manual':
        return <ManualAttendance students={students} logs={logs} onAttendanceMarked={onAttendanceMarked} schoolId={school.id} />;
      case 'fingerprint':
        return (
            <div className="text-center py-20 flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-1.026.977-2.19.977-3.417a6 6 0 00-12 0c0 1.227.332 2.391.977 3.417M6.84 17.07a21.88 21.88 0 002.322 2.763M12 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Coming Soon!</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
                    The fingerprint-based attendance system is currently under development and will be available in a future update.
                </p>
            </div>
          );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Attendance Modes">
          <button onClick={() => setActiveMode('summary')} className={`${activeMode === 'summary' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
            Summary
          </button>
          <button onClick={() => setActiveMode('manual')} className={`${activeMode === 'manual' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
            Manual Entry
          </button>
          <button onClick={() => setActiveMode('fingerprint')} className={`${activeMode === 'fingerprint' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
            Fingerprint
          </button>
        </nav>
      </div>
      {renderContent()}
      <DownloadReportModal
        isOpen={isDownloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        onDownload={handleDownloadSchoolReport}
        title="Download Daily Attendance Report"
      />
      <StudentAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setAnalysisModalOpen(false)}
        students={students}
        school={school}
        showToast={showToast}
    />
    </div>
  );
};

export default AttendanceManager;