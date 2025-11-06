import React, { useMemo } from 'react';
import { Student, AttendanceLog, AttendanceStatus } from '../../types';

interface ClassSummary {
  className: string;
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

interface ClassAttendanceSummaryProps {
  students: Student[];
  logs: AttendanceLog[];
}

const ClassAttendanceSummary: React.FC<ClassAttendanceSummaryProps> = ({ students, logs }) => {
  const summaryData = useMemo((): ClassSummary[] => {
    // 1. Get IDs of students who are present today (have an IN or OUT log)
    const presentStudentIds = new Set(
      logs
        .filter(log => log.entity_type === 'student' && (log.status === AttendanceStatus.IN || log.status === AttendanceStatus.OUT))
        .map(log => log.entity_id)
    );

    // 2. Group students by class
    const studentsByClass = students.reduce((acc, student) => {
      const className = student.class || 'N/A';
      if (!acc[className]) {
        acc[className] = [];
      }
      acc[className].push(student);
      return acc;
    }, {} as Record<string, Student[]>);

    // 3. Calculate stats for each class
    const data = Object.entries(studentsByClass).map(([className, classStudents]) => {
      // FIX: Explicitly cast classStudents to Student[] to resolve type inference issues on lines 38 and 42.
      const studentList = classStudents as Student[];
      const total = studentList.length;
      if (total === 0) {
        return { className, total, present: 0, absent: 0, percentage: 0 };
      }
      const present = studentList.filter(s => presentStudentIds.has(s.student_id)).length;
      const absent = total - present;
      const percentage = Math.round((present / total) * 100);

      return { className, total, present, absent, percentage };
    });

    // Sort by class name for consistent order
    return data.sort((a, b) => a.className.localeCompare(b.className));
  }, [students, logs]);

  if (summaryData.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 col-span-full">No class data to display.</p>;
  }
  
  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {summaryData.map(summary => (
        <div key={summary.className} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
          <div className="flex justify-between items-baseline">
            <p className="font-bold text-lg text-neutral dark:text-gray-200">{summary.className}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total: {summary.total}</p>
          </div>
          <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                  <span className="text-green-600 dark:text-green-400 font-semibold">Present: {summary.present}</span>
                  <span className="text-red-600 dark:text-red-400 font-semibold">Absent: {summary.absent}</span>
              </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${getProgressBarColor(summary.percentage)} transition-all duration-500`} 
                style={{ width: `${summary.percentage}%` }}
                role="progressbar"
                aria-valuenow={summary.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${summary.className} attendance percentage`}
              ></div>
            </div>
            <p className="text-right text-sm font-semibold text-neutral dark:text-gray-300">{summary.percentage}%</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClassAttendanceSummary;