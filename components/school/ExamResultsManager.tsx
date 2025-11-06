import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Student, ExamSession, ClassName, CLASS_NAMES, StudentResult } from '../../types';
import MarksEntryModal from './MarksEntryModal';

interface ExamResultsManagerProps {
    students: Student[];
    showToast: (message: string) => void;
    schoolId: string;
}

const ExamResultsManager: React.FC<ExamResultsManagerProps> = ({ students, showToast, schoolId }) => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<ExamSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<ClassName | ''>('');
    const [isSessionModalOpen, setSessionModalOpen] = useState(false);
    const [newSessionName, setNewSessionName] = useState('');
    const [loading, setLoading] = useState(true);
    
    const [results, setResults] = useState<StudentResult[]>([]);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [publishing, setPublishing] = useState(false);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        api.getExamSessions(user.token, schoolId)
            .then(data => {
                setSessions(data);
                if (data.length > 0) {
                    setSelectedSession(data[0].id);
                }
            })
            .catch(err => showToast(`Error: ${(err as Error).message}`))
            .finally(() => setLoading(false));
    }, [user, showToast, schoolId]);
    
    useEffect(() => {
        if(selectedClass && selectedSession && user) {
            setLoading(true);
            api.getResultsForClass(user.token, schoolId, selectedSession, selectedClass)
            .then(data => setResults(data))
            .catch(err => showToast(`Error fetching results: ${(err as Error).message}`))
            .finally(() => setLoading(false));
        }
    }, [selectedClass, selectedSession, user, showToast, schoolId]);

    const handleCreateSession = async () => {
        if (!user || !newSessionName.trim()) return;
        try {
            const newSession = await api.createExamSession(user.token, schoolId, newSessionName);
            setSessions(prev => [newSession, ...prev]);
            setSelectedSession(newSession.id);
            setNewSessionName('');
            setSessionModalOpen(false);
            showToast('New exam session created.');
        } catch (err) {
            showToast(`Error: ${(err as Error).message}`);
        }
    };

    const handleSaveResult = async (result: StudentResult) => {
        if (!user) return;
        setPublishing(true); // Use publishing state for individual save
        try {
            await api.saveStudentResult(user.token, schoolId, result);
            setResults(prev => {
                const existing = prev.find(r => r.studentId === result.studentId);
                if (existing) {
                    return prev.map(r => r.studentId === result.studentId ? result : r);
                }
                return [...prev, result];
            });
            showToast(`Result saved for ${result.studentName}.`);
            setEditingStudent(null);
        } catch (err) {
            showToast(`Error saving result: ${(err as Error).message}`);
        } finally {
            setPublishing(false);
        }
    };
    
    const studentsInClass = useMemo(() => {
        return students.filter(s => s.class === selectedClass);
    }, [students, selectedClass]);

    const getStudentResult = (studentId: string) => {
        return results.find(r => r.studentId === studentId);
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-neutral dark:text-gray-200 mb-4">Exam Results Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                    <label htmlFor="session" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exam Session</label>
                    <select id="session" value={selectedSession} onChange={e => setSelectedSession(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md">
                        {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="class" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
                    <select id="class" value={selectedClass} onChange={e => setSelectedClass(e.target.value as ClassName)} className="mt-1 block w-full pl-3 pr-10 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md">
                        <option value="">-- Select Class --</option>
                        {CLASS_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
                <div className="flex items-end">
                    <button onClick={() => setSessionModalOpen(true)} className="w-full py-2 px-4 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-hover">
                        + Create Session
                    </button>
                </div>
            </div>

            {selectedClass && selectedSession ? (
                loading ? <p>Loading students...</p> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Student Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Roll No.</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Action</th>
                                </tr>
                             </thead>
                             <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {studentsInClass.map(student => {
                                    const result = getStudentResult(student.student_id);
                                    return (
                                        <tr key={student.student_id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{student.roll_no}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                {result ? 
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Entered ({result.percentage.toFixed(2)}%)</span> :
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                <button onClick={() => setEditingStudent(student)} className="px-3 py-1 text-xs bg-primary text-white font-semibold rounded-md shadow-sm hover:bg-primary-hover">
                                                    {result ? 'Edit Marks' : 'Enter Marks'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                             </tbody>
                        </table>
                    </div>
                )
            ) : <p className="text-center text-gray-500 dark:text-gray-400">Please select an exam session and a class to enter results.</p>}

            {isSessionModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
                        <h3 className="text-lg font-semibold mb-4">Create New Exam Session</h3>
                        <input type="text" value={newSessionName} onChange={e => setNewSessionName(e.target.value)} placeholder="e.g., Final Term 2024" className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                        <div className="mt-4 flex justify-end gap-3">
                            <button onClick={() => setSessionModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-600 rounded-md">Cancel</button>
                            <button onClick={handleCreateSession} className="px-4 py-2 text-sm text-white bg-primary rounded-md">Create</button>
                        </div>
                    </div>
                </div>
            )}
            
            {editingStudent && selectedClass && selectedSession && user && (
                <MarksEntryModal 
                    isOpen={!!editingStudent}
                    onClose={() => setEditingStudent(null)}
                    student={editingStudent}
                    session={{id: selectedSession, name: sessions.find(s=>s.id === selectedSession)?.name || '', schoolId: user.id, timestamp: ''}}
                    existingResult={getStudentResult(editingStudent.student_id)}
                    onSave={handleSaveResult}
                    isSaving={publishing}
                />
            )}
        </div>
    );
};

export default ExamResultsManager;