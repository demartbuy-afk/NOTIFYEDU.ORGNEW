import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Teacher, ClassRoutineEntry } from '../../types';

interface AllClassRoutinesViewerProps {
    teachers: Teacher[];
    schoolId: string;
}

const AllClassRoutinesViewer: React.FC<AllClassRoutinesViewerProps> = ({ teachers, schoolId }) => {
    const [allRoutines, setAllRoutines] = useState<ClassRoutineEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;
        const fetchRoutines = async () => {
            setLoading(true);
            try {
                const routines = await api.getAllSchoolClassRoutines(schoolId, user.token);
                setAllRoutines(routines);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };
        fetchRoutines();
    }, [user, schoolId]);

    const routinesByClass = useMemo(() => {
        return allRoutines.reduce((acc, entry) => {
            const className = entry.class_name;
            if (!acc[className]) {
                acc[className] = [];
            }
            acc[className].push(entry);
            return acc;
        }, {} as Record<string, ClassRoutineEntry[]>);
    }, [allRoutines]);

    const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t])), [teachers]);

    const formatTime = (time: string) => {
        if (!time) return 'N/A';
        const [hourStr, minute] = time.split(':');
        const hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minute} ${ampm}`;
    };

    if (loading) {
        return <div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-200 p-4 rounded-lg">{error}</div>;
    }

    const classNames = Object.keys(routinesByClass).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    if (classNames.length === 0) {
        return <div className="text-center text-gray-500 dark:text-gray-400 py-8">No routines have been set for any class yet. Go to 'Edit Mode' to create one.</div>;
    }

    return (
        <div className="space-y-3">
            {classNames.map(className => {
                const routinesForClass = routinesByClass[className].sort((a, b) => a.start_time.localeCompare(b.start_time));
                return (
                    <details key={className} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg open:shadow-lg transition-shadow">
                        <summary className="p-4 font-semibold text-lg text-neutral dark:text-gray-200 cursor-pointer list-none flex justify-between items-center">
                            Class {className}
                            <svg className="w-5 h-5 transition-transform transform details-arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </summary>
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                                        <tr>
                                            <th className="py-2 px-3 text-left">Time Slot</th>
                                            <th className="py-2 px-3 text-left">Subject</th>
                                            <th className="py-2 px-3 text-left">Teacher</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {routinesForClass.map(entry => (
                                            <tr key={entry.id}>
                                                <td className="py-2 px-3 text-sm font-medium text-gray-900 dark:text-gray-100">{formatTime(entry.start_time)} - {formatTime(entry.end_time)}</td>
                                                <td className="py-2 px-3 text-sm text-gray-700 dark:text-gray-300">{entry.subject}</td>
                                                <td className="py-2 px-3 text-sm text-gray-600 dark:text-gray-400">{teacherMap.get(entry.teacher_id)?.name || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </details>
                );
            })}
            <style>{`
                details > summary::-webkit-details-marker { display: none; }
                details[open] .details-arrow { transform: rotate(180deg); }
            `}</style>
        </div>
    );
}

export default AllClassRoutinesViewer;