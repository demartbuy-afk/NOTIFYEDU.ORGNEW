import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { Student, Teacher, ClassRoutineEntry } from '../../types';

interface ClassRoutineViewerProps {
    student: Student;
}

interface RoutineWithTeacher extends ClassRoutineEntry {
    teacher?: Teacher;
}

const ClassRoutineViewer: React.FC<ClassRoutineViewerProps> = ({ student }) => {
    const [routine, setRoutine] = useState<RoutineWithTeacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRoutine = async () => {
            setLoading(true);
            setError(null);
            try {
                const { routine: routineData, teachers } = await api.getStudentClassRoutine(student.id, student.token);
                const teacherMap = new Map(teachers.map(t => [t.id, t]));
                
                const combinedData = routineData.map(entry => ({
                    ...entry,
                    teacher: teacherMap.get(entry.teacher_id)
                })).sort((a,b) => a.start_time.localeCompare(b.start_time));

                setRoutine(combinedData);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };
        fetchRoutine();
    }, [student]);

    const formatTime = (time: string) => {
        if (!time) return 'N/A';
        const [hourStr, minute] = time.split(':');
        const hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minute} ${ampm}`;
    };

    const renderContent = () => {
        if (loading) {
            return <p className="text-center text-gray-500 dark:text-gray-400">Loading routine...</p>;
        }
        if (error) {
            return <p className="text-center text-red-500">{error}</p>;
        }
        if (routine.length === 0) {
            return <p className="text-center text-gray-500 dark:text-gray-400">Your class routine has not been set by the school yet.</p>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Time Slot</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Subject</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Teacher Details</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {routine.map(entry => (
                            <tr key={entry.id}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-semibold">{entry.subject}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {entry.teacher ? (
                                        <>
                                            <div>{entry.teacher.name}</div>
                                            <div className="text-xs">{entry.teacher.phone_number}</div>
                                        </>
                                    ) : (
                                        'Not Assigned'
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-neutral dark:text-gray-200 mb-4">Class Routine</h2>
            {renderContent()}
        </div>
    );
};

export default ClassRoutineViewer;