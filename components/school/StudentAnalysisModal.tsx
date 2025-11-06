import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { School, Student, AttendanceLog, AttendanceStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { downloadCSV } from '../../utils/csv';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  school: School;
  showToast: (message: string) => void;
}

interface AnalysisData {
    lateComers: { student: Student, count: number }[];
    absentees: { student: Student, count: number }[];
}

const StudentAnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, students, school, showToast }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      const fetchAndAnalyze = async () => {
        setLoading(true);
        setError(null);
        setAnalysisData(null);
        try {
          const monthlyLogs = await api.getMonthlyAttendanceLogs(user.id, user.token);
          
          const lateCount = new Map<string, number>();
          const absentCount = new Map<string, number>();
          const openingTime = school.opening_time || '23:59'; // Default to a very late time if not set

          monthlyLogs.forEach(log => {
              if (log.status === AttendanceStatus.ABSENT) {
                  // FIX: Changed student_id to entity_id to match the AttendanceLog type.
                  absentCount.set(log.entity_id, (absentCount.get(log.entity_id) || 0) + 1);
              } else if (log.status === AttendanceStatus.IN) {
                  const logTime = new Date(log.timestamp).toTimeString().substring(0, 5); // "HH:MM"
                  if (logTime > openingTime) {
                      // FIX: Changed student_id to entity_id to match the AttendanceLog type.
                      lateCount.set(log.entity_id, (lateCount.get(log.entity_id) || 0) + 1);
                  }
              }
          });
          
          const studentMap = new Map(students.map(s => [s.student_id, s]));

          const lateComers = Array.from(lateCount.entries())
            .map(([studentId, count]) => ({ student: studentMap.get(studentId)!, count }))
            .filter(item => item.student)
            .sort((a, b) => b.count - a.count);

          const absentees = Array.from(absentCount.entries())
            .map(([studentId, count]) => ({ student: studentMap.get(studentId)!, count }))
            .filter(item => item.student)
            .sort((a, b) => b.count - a.count);

          setAnalysisData({ lateComers, absentees });

        } catch (err) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      };
      fetchAndAnalyze();
    }
  }, [isOpen, user, students, school.opening_time]);
  
  const handleDownload = () => {
      if (!analysisData) return;
      const headers = ['Analysis Type', 'Student Name', 'Roll No.', 'Class', 'Count'];
      const data: (string | number)[][] = [];
      
      analysisData.lateComers.forEach(item => {
          data.push(['Late Coming', item.student.name, item.student.roll_no, item.student.class, item.count]);
      });
      analysisData.absentees.forEach(item => {
          data.push(['Absence', item.student.name, item.student.roll_no, item.student.class, item.count]);
      });

      const monthName = new Date().toLocaleString('default', { month: 'long' });
      downloadCSV(headers, data, `Monthly_Analysis_${monthName}.csv`);
      showToast('Report downloaded successfully!');
  };

  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>;
    }
    if (error) {
      return <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>;
    }
    if (!analysisData) {
      return <p className="text-center text-gray-500">No data to analyze for this month.</p>;
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnalysisList title="Frequent Late Comers" data={analysisData.lateComers} unit="times" />
            <AnalysisList title="Frequent Absentees" data={analysisData.absentees} unit="days" />
        </div>
    );
  };
  
  if (!isOpen) return null;
  
  const monthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
            Student Analysis for {monthName}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {renderContent()}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">
            Close
          </button>
          <button type="button" onClick={handleDownload} disabled={!analysisData || loading} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary-hover disabled:opacity-50">
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
};

const AnalysisList: React.FC<{title: string, data: {student: Student, count: number}[], unit: string}> = ({title, data, unit}) => (
    <div>
        <h4 className="font-semibold text-neutral dark:text-gray-200 mb-3">{title}</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {data.length > 0 ? data.map(({ student, count }) => (
                <div key={student.student_id} className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md flex justify-between items-center">
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Roll: {student.roll_no}</p>
                    </div>
                    <span className="font-bold text-lg text-primary">{count} <span className="text-xs font-normal text-gray-500">{unit}</span></span>
                </div>
            )) : <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">No students in this category.</p>}
        </div>
    </div>
);

export default StudentAnalysisModal;