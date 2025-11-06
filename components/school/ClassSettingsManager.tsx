import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Teacher, ClassName, CLASS_NAMES, ClassRoutineEntry } from '../../types';
import AllClassRoutinesViewer from './AllClassRoutinesViewer';

interface ClassSettingsManagerProps {
    teachers: Teacher[];
    schoolId: string;
    showToast: (message: string) => void;
}

type EditableRoutineEntry = Omit<ClassRoutineEntry, 'id' | 'school_id' | 'class_name'> & { id?: string };

const ClassSettingsManager: React.FC<ClassSettingsManagerProps> = ({ teachers, schoolId, showToast }) => {
    const { user } = useAuth();
    const [selectedClass, setSelectedClass] = useState<ClassName | ''>('');
    const [routine, setRoutine] = useState<EditableRoutineEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'edit' | 'viewAll'>('edit');

    useEffect(() => {
        const fetchRoutine = async () => {
            if (!selectedClass || !user || viewMode !== 'edit') return;
            setLoading(true);
            try {
                const data = await api.getSchoolClassRoutine(schoolId, user.token, selectedClass);
                setRoutine(data);
            } catch (error) {
                showToast(`Error fetching routine: ${(error as Error).message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchRoutine();
    }, [selectedClass, user, showToast, viewMode, schoolId]);

    const handleUpdateEntry = (index: number, field: keyof EditableRoutineEntry, value: string) => {
        const updatedRoutine = [...routine];
        updatedRoutine[index] = { ...updatedRoutine[index], [field]: value };
        setRoutine(updatedRoutine);
    };

    const handleAddPeriod = () => {
        setRoutine([...routine, { start_time: '', end_time: '', subject: '', teacher_id: '' }]);
    };

    const handleRemovePeriod = (index: number) => {
        setRoutine(routine.filter((_, i) => i !== index));
    };

    const handleSaveRoutine = async () => {
        if (!selectedClass || !user) return;
        setSaving(true);
        try {
            await api.updateSchoolClassRoutine(schoolId, user.token, selectedClass, routine);
            showToast(`Routine for Class ${selectedClass} saved successfully!`);
        } catch (error) {
            showToast(`Error saving routine: ${(error as Error).message}`);
        } finally {
            setSaving(false);
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-neutral dark:text-gray-200">Class Routine Settings</h2>
                <div className="flex items-center p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                    <button 
                        onClick={() => setViewMode('edit')} 
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'edit' ? 'bg-white dark:bg-gray-800 text-primary shadow' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                        Edit Mode
                    </button>
                    <button 
                        onClick={() => setViewMode('viewAll')} 
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'viewAll' ? 'bg-white dark:bg-gray-800 text-primary shadow' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                        View All
                    </button>
                </div>
            </div>

            {viewMode === 'edit' ? (
                <>
                    <div className="mb-6 max-w-sm">
                        <label htmlFor="classSelector" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select a Class to Edit</label>
                        <select 
                            id="classSelector" 
                            value={selectedClass} 
                            onChange={e => setSelectedClass(e.target.value as ClassName)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        >
                            <option value="">-- Select Class --</option>
                            {CLASS_NAMES.map(name => <option key={name} value={name}>Class {name}</option>)}
                        </select>
                    </div>

                    {selectedClass && (
                        <div>
                            {loading ? (
                                <p>Loading routine...</p>
                            ) : (
                                <div className="space-y-4">
                                    {routine.map((entry, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <input type="time" value={entry.start_time} onChange={e => handleUpdateEntry(index, 'start_time', e.target.value)} className="w-full px-2 py-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md" />
                                            <input type="time" value={entry.end_time} onChange={e => handleUpdateEntry(index, 'end_time', e.target.value)} className="w-full px-2 py-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md" />
                                            <input type="text" placeholder="Subject" value={entry.subject} onChange={e => handleUpdateEntry(index, 'subject', e.target.value)} className="md:col-span-1 w-full px-2 py-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md" />
                                            <select value={entry.teacher_id} onChange={e => handleUpdateEntry(index, 'teacher_id', e.target.value)} className="md:col-span-1 w-full px-2 py-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md">
                                                <option value="">Select Teacher</option>
                                                {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>)}
                                            </select>
                                            <button onClick={() => handleRemovePeriod(index)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center mt-4">
                                        <button onClick={handleAddPeriod} className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20">+ Add Period</button>
                                        <button onClick={handleSaveRoutine} disabled={saving} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover disabled:bg-gray-400">
                                            {saving ? 'Saving...' : 'Save Routine'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <AllClassRoutinesViewer teachers={teachers} schoolId={schoolId} />
            )}
        </div>
    );
};

export default ClassSettingsManager;