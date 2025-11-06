import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Student, AttendanceStatus, AttendanceLog } from '../../types';

interface ManualAttendanceProps {
  students: Student[];
  logs: AttendanceLog[];
  onAttendanceMarked: (log: AttendanceLog) => void;
  schoolId: string;
}

type StudentStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'OUT' | 'NOT_MARKED';

const LATE_THRESHOLD_HOUR = 10; // 10:00 AM

const StatusIndicator: React.FC<{ status: StudentStatus }> = ({ status }) => {
    const baseClasses = "w-3 h-3 rounded-full flex-shrink-0";
    const statusMap: Record<StudentStatus, { color: string; label: string }> = {
        PRESENT: { color: 'bg-green-500', label: 'Present' },
        LATE: { color: 'bg-yellow-500', label: 'Late' },
        ABSENT: { color: 'bg-red-500', label: 'Absent' },
        OUT: { color: 'bg-gray-400', label: 'Checked Out' },
        NOT_MARKED: { color: 'bg-gray-200 dark:bg-gray-600', label: 'Not Marked' },
    };
    return <div className={`${baseClasses} ${statusMap[status].color}`} title={statusMap[status].label} />;
};

const ManualAttendance: React.FC<ManualAttendanceProps> = ({ students, logs, onAttendanceMarked, schoolId }) => {
  const { user } = useAuth();
  const [loadingStudentId, setLoadingStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const studentStatuses = useMemo(() => {
    const logMap = new Map<string, AttendanceLog>();
    // Get the latest log for each student today
    logs.forEach(log => {
        if (log.entity_type !== 'student') return;
        const existing = logMap.get(log.entity_id);
        if (!existing || new Date(log.timestamp) > new Date(existing.timestamp)) {
            logMap.set(log.entity_id, log);
        }
    });

    return students.map(student => {
        const log = logMap.get(student.student_id);
        let status: StudentStatus = 'NOT_MARKED';
        if (log) {
            switch (log.status) {
                case AttendanceStatus.BUS_IN:
                case AttendanceStatus.IN:
                    const logTime = new Date(log.timestamp);
                    status = logTime.getHours() >= LATE_THRESHOLD_HOUR ? 'LATE' : 'PRESENT';
                    break;
                case AttendanceStatus.BUS_OUT:
                case AttendanceStatus.OUT:
                    status = 'OUT';
                    break;
                case AttendanceStatus.ABSENT:
                    status = 'ABSENT';
                    break;
            }
        }
        return { ...student, status };
    });
  }, [students, logs]);
  
  const filteredStudents = useMemo(() => 
    studentStatuses.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.roll_no.toLowerCase().includes(searchQuery.toLowerCase())
    ), [studentStatuses, searchQuery]);


  const handleMarkAttendance = async (studentId: string, status: AttendanceStatus) => {
    if (!user) return;
    setLoadingStudentId(studentId);
    try {
      const log = await api.markAttendance(schoolId, user.token, studentId, status, undefined, 'student');
      onAttendanceMarked(log);
    } catch (err) {
      console.error("Failed to mark attendance:", (err as Error).message);
    } finally {
      setLoadingStudentId(null);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search student..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
      />
      <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
        {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => {
              const isLoading = loadingStudentId === student.student_id;
              const hasCheckedIn = student.status === 'PRESENT' || student.status === 'LATE';
              const hasCheckedOut = student.status === 'OUT';

              return (
                <div key={student.student_id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-md">
                  <div className="flex items-center space-x-3 truncate">
                    <StatusIndicator status={student.status} />
                    <div className="truncate">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{student.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Roll: {student.roll_no}</p>
                    </div>
                  </div>
                  
                  {isLoading ? (
                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  ) : (
                    <div className="flex space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleMarkAttendance(student.student_id, AttendanceStatus.IN)}
                        disabled={hasCheckedIn || hasCheckedOut}
                        className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded hover:bg-green-200 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
                      >
                        IN
                      </button>
                      <button
                        onClick={() => handleMarkAttendance(student.student_id, AttendanceStatus.OUT)}
                        disabled={!hasCheckedIn}
                        className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded hover:bg-red-200 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed"
                      >
                        OUT
                      </button>
                    </div>
                  )}
                </div>
              );
            })
        ) : (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">No students match your search.</p>
        )}
      </div>
    </div>
  );
};

export default ManualAttendance;