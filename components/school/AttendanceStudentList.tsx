import React, { useMemo } from 'react';
import { Student, AttendanceLog, AttendanceStatus } from '../../types';

interface AttendanceStudentListProps {
  students: Student[];
  logs: AttendanceLog[];
}

const StatusPill: React.FC<{ status?: AttendanceStatus; inTime?: string | null; outTime?: string | null; busInTime?: string | null; busOutTime?: string | null; }> = 
({ status, inTime, outTime, busInTime, busOutTime }) => {
    switch (status) {
        case AttendanceStatus.IN:
            return <div className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">IN @ {inTime}</div>;
        case AttendanceStatus.OUT:
            return <div className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">OUT @ {outTime}</div>;
        case AttendanceStatus.BUS_IN:
            return <div className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">ON BUS @ {busInTime}</div>;
        case AttendanceStatus.BUS_OUT:
            return <div className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">BUS OUT @ {busOutTime}</div>;
        case AttendanceStatus.ABSENT:
             return <div className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100">ABSENT</div>;
        default:
            return <div className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Not Marked</div>;
    }
};


const AttendanceStudentList: React.FC<AttendanceStudentListProps> = ({ students, logs }) => {
    
    const formatTime = (timestamp: string) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const studentDailyInfo = useMemo(() => {
        const info = new Map<string, { 
            inTime: string | null; 
            outTime: string | null;
            busInTime: string | null;
            busOutTime: string | null;
            latestStatus?: AttendanceStatus;
        }>();
        const studentLogs = new Map<string, AttendanceLog[]>();
        
        const filteredLogs = logs.filter(log => log.entity_type === 'student');

        filteredLogs.forEach(log => {
            if (!studentLogs.has(log.entity_id)) {
                studentLogs.set(log.entity_id, []);
            }
            studentLogs.get(log.entity_id)!.push(log);
        });

        students.forEach(student => {
            const logsForStudent = studentLogs.get(student.student_id) || [];
            if (logsForStudent.length > 0) {
                logsForStudent.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                const firstIn = logsForStudent.find(l => l.status === AttendanceStatus.IN);
                const lastOut = logsForStudent.filter(l => l.status === AttendanceStatus.OUT).pop();
                const firstBusIn = logsForStudent.find(l => l.status === AttendanceStatus.BUS_IN);
                const lastBusOut = logsForStudent.filter(l => l.status === AttendanceStatus.BUS_OUT).pop();
                
                info.set(student.student_id, {
                    inTime: firstIn ? formatTime(firstIn.timestamp) : null,
                    outTime: lastOut ? formatTime(lastOut.timestamp) : null,
                    busInTime: firstBusIn ? formatTime(firstBusIn.timestamp) : null,
                    busOutTime: lastBusOut ? formatTime(lastBusOut.timestamp) : null,
                    latestStatus: logsForStudent[logsForStudent.length - 1].status
                });
            } else {
                info.set(student.student_id, { inTime: null, outTime: null, busInTime: null, busOutTime: null, latestStatus: undefined });
            }
        });
        return info;
    }, [students, logs]);
    
    const sortedStudents = useMemo(() => {
        const getStatusPriority = (studentId: string): number => {
            const info = studentDailyInfo.get(studentId);
            if (!info || !info.latestStatus) return 2; // Not Marked
            switch(info.latestStatus) {
                case AttendanceStatus.IN: return 1; // Top
                case AttendanceStatus.OUT: return 3; // Bottom
                default: return 2; // ABSENT, etc. in the middle
            }
        };

        return [...students].sort((a, b) => {
            const priorityA = getStatusPriority(a.student_id);
            const priorityB = getStatusPriority(b.student_id);
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
            return a.name.localeCompare(b.name);
        });
    }, [students, studentDailyInfo]);


    if (students.length === 0) {
        return <p className="text-center text-gray-500 dark:text-gray-400 py-4">No students in this category.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {sortedStudents.map((student) => {
              const timings = studentDailyInfo.get(student.student_id);
              return (
                <div key={student.student_id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                            {student.name.charAt(0)}
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{student.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Roll: {student.roll_no} | Class: {student.class}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end items-center">
                         <StatusPill 
                            status={timings?.latestStatus} 
                            inTime={timings?.inTime} 
                            outTime={timings?.outTime}
                            busInTime={timings?.busInTime}
                            busOutTime={timings?.busOutTime}
                        />
                    </div>
                </div>
              )
            })}
        </div>
    );
};

export default AttendanceStudentList;