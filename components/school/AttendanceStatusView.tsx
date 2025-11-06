import React, { useMemo } from 'react';
import { Student, AttendanceLog, AttendanceStatus } from '../../types';

interface AttendanceStatusViewProps {
  students: Student[];
  logs: AttendanceLog[];
}

interface StudentWithStatus extends Student {
    lastLog?: AttendanceLog;
}

const AttendanceStatusView: React.FC<AttendanceStatusViewProps> = ({ students, logs }) => {

  const { checkedIn, checkedOut, notMarked } = useMemo(() => {
    const latestLogs = new Map<string, AttendanceLog>();
    logs.forEach(log => {
      // FIX: Changed student_id to entity_id to match the AttendanceLog type.
      const existing = latestLogs.get(log.entity_id);
      if (!existing || new Date(log.timestamp) > new Date(existing.timestamp)) {
        // FIX: Changed student_id to entity_id to match the AttendanceLog type.
        latestLogs.set(log.entity_id, log);
      }
    });

    const checkedIn: StudentWithStatus[] = [];
    const checkedOut: StudentWithStatus[] = [];
    const notMarked: StudentWithStatus[] = [];
    
    students.forEach(student => {
        const lastLog = latestLogs.get(student.student_id);
        if (lastLog) {
            if (lastLog.status === AttendanceStatus.IN) {
                checkedIn.push({ ...student, lastLog });
            } else if (lastLog.status === AttendanceStatus.OUT) {
                checkedOut.push({ ...student, lastLog });
            }
        } else {
            notMarked.push(student);
        }
    });

    return { checkedIn, checkedOut, notMarked };
  }, [students, logs]);
  
  const formatTime = (timestamp: string) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const StudentListColumn: React.FC<{title: string, count: number, students: StudentWithStatus[], colorClasses: string, emptyMessage: string}> = 
    ({ title, count, students, colorClasses, emptyMessage }) => (
        <div className={`${colorClasses} p-4 rounded-lg`}>
            <h4 className="font-semibold mb-3">{title} ({count})</h4>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                {students.length > 0 ? students.map(s => (
                    <div key={s.student_id} className="bg-white dark:bg-gray-800 p-2 rounded-md flex justify-between items-center shadow-sm">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Roll: {s.roll_no}</p>
                        </div>
                        {s.lastLog && (
                             <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{formatTime(s.lastLog.timestamp)}</span>
                        )}
                    </div>
                )) : <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">{emptyMessage}</p>}
            </div>
        </div>
    );

  return (
    <div>
        <h3 className="text-xl font-bold text-neutral dark:text-gray-200 mb-4">Live Student Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StudentListColumn 
                title="Checked IN"
                count={checkedIn.length}
                students={checkedIn}
                colorClasses="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                emptyMessage="No students checked in."
            />
            <StudentListColumn 
                title="Checked OUT"
                count={checkedOut.length}
                students={checkedOut}
                colorClasses="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                emptyMessage="No students checked out."
            />
            <StudentListColumn 
                title="Not Marked Today"
                count={notMarked.length}
                students={notMarked}
                colorClasses="bg-gray-100 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200"
                emptyMessage="All students are marked."
            />
        </div>
    </div>
  );
};

export default AttendanceStatusView;