import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { downloadCSV } from '../../utils/csv';
import { AttendanceLog, AttendanceStatus } from '../../types';
import ThemeToggle from '../common/ThemeToggle';
import AnimatedLogo from '../common/AnimatedLogo';

const PublicPageHeader: React.FC<{ title: string; showLogin?: boolean; }> = ({ title, showLogin = true }) => {
    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2 logo-container">
                        <AnimatedLogo />
                        <span className="text-2xl font-bold text-neutral dark:text-gray-100">{title}</span>
                    </Link>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <ThemeToggle />
                        {showLogin && (
                            <Link to="/login" className="px-4 py-2 text-sm font-medium text-primary bg-transparent border border-primary rounded-lg hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus transition-colors">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

const TeacherPortal: React.FC = () => {
  const [teacherId, setTeacherId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId.trim()) {
        setError("Please enter a valid Teacher ID.");
        return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
        const logs = await api.getTeacherMonthlyReport(teacherId);

        if (logs.length === 0) {
            setSuccess("No attendance data found for this month.");
            return;
        }

        const logsByDate = logs.reduce((acc, log) => {
            const dateStr = new Date(log.timestamp).toLocaleDateString();
            if (!acc[dateStr]) acc[dateStr] = [];
            acc[dateStr].push(log);
            return acc;
        }, {} as Record<string, AttendanceLog[]>);

        const data: (string | number)[][] = [];
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toLocaleDateString();
            const dailyLogs = logsByDate[dateStr];
            
            if (dailyLogs) {
                dailyLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                const firstIn = dailyLogs.find(l => l.status === AttendanceStatus.IN);
                const lastOut = dailyLogs.filter(l => l.status === AttendanceStatus.OUT).pop();
                
                data.push([
                    dateStr,
                    'PRESENT',
                    firstIn ? new Date(firstIn.timestamp).toLocaleTimeString() : 'N/A',
                    lastOut ? new Date(lastOut.timestamp).toLocaleTimeString() : 'N/A'
                ]);
            } else {
                 data.push([dateStr, 'ABSENT', 'N/A', 'N/A']);
            }
        }

        const headers = ['Date', 'Status', 'Check-in Time', 'Check-out Time'];
        const teacherName = logs[0]?.entity_name.replace(/\s+/g, '_') || teacherId;
        const monthName = today.toLocaleString('default', { month: 'long' });

        downloadCSV(headers, data, `Attendance_Report_${teacherName}_${monthName}.csv`);
        setSuccess("Report downloaded successfully!");

    } catch (err) {
        setError((err as Error).message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
      <PublicPageHeader title="Teacher Portal" />
      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-md mx-auto py-12 px-4 sm:px-6 lg:px-8 w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-neutral dark:text-gray-100">
                Download Your Report
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Enter your Teacher ID to download your attendance report for the current month.
              </p>
            </div>

            <form onSubmit={handleDownload} className="space-y-6">
              <div>
                <label htmlFor="teacherId" className="sr-only">Teacher ID</label>
                <input
                  type="text"
                  id="teacherId"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  placeholder="Enter your Teacher ID"
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus disabled:bg-indigo-300"
              >
                {loading ? 'Generating...' : 'Download Report'}
              </button>
              
              <div className="h-5 text-center text-sm">
                {error && <p className="text-red-500">{error}</p>}
                {success && <p className="text-green-500">{success}</p>}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherPortal;