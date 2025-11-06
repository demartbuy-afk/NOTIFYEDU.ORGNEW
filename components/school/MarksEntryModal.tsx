import React, { useState, useEffect, useMemo } from 'react';
import { Student, ExamSession, SubjectMark, StudentResult } from '../../types';

interface MarksEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  session: ExamSession;
  existingResult?: StudentResult | null;
  onSave: (result: StudentResult) => void;
  isSaving: boolean;
}

const MarksEntryModal: React.FC<MarksEntryModalProps> = ({ isOpen, onClose, student, session, existingResult, onSave, isSaving }) => {
  const [marks, setMarks] = useState<SubjectMark[]>([{ subjectName: '', marksObtained: 0, totalMarks: 100 }]);

  useEffect(() => {
    if (existingResult && existingResult.marks.length > 0) {
      setMarks(existingResult.marks);
    } else {
      setMarks([{ subjectName: '', marksObtained: 0, totalMarks: 100 }]);
    }
  }, [existingResult]);
  
  const handleMarkChange = (index: number, field: keyof SubjectMark, value: string | number) => {
    const newMarks = [...marks];
    (newMarks[index] as any)[field] = field === 'subjectName' ? value : Number(value);
    setMarks(newMarks);
  };

  const addSubject = () => {
    setMarks([...marks, { subjectName: '', marksObtained: 0, totalMarks: 100 }]);
  };

  const removeSubject = (index: number) => {
    setMarks(marks.filter((_, i) => i !== index));
  };
  
  const { totalMarksObtained, totalMaxMarks, percentage } = useMemo(() => {
    const totalMarksObtained = marks.reduce((sum, m) => sum + (m.marksObtained || 0), 0);
    const totalMaxMarks = marks.reduce((sum, m) => sum + (m.totalMarks || 0), 0);
    const percentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
    return { totalMarksObtained, totalMaxMarks, percentage };
  }, [marks]);
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result: StudentResult = {
      id: `${session.id}_${student.student_id}`,
      sessionId: session.id,
      studentId: student.student_id,
      studentName: student.name,
      rollNo: student.roll_no,
      schoolId: student.school_id,
      className: student.class as any,
      marks: marks,
      totalMarksObtained,
      totalMaxMarks,
      percentage,
    };
    onSave(result);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleFormSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold">Enter Marks for {student.name}</h3>
          <p className="text-sm text-gray-500">Session: {session.name}</p>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {marks.map((mark, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              <input
                type="text"
                placeholder="Subject Name"
                value={mark.subjectName}
                onChange={e => handleMarkChange(index, 'subjectName', e.target.value)}
                required
                className="md:col-span-2 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
              />
              <input
                type="number"
                placeholder="Marks Obtained"
                value={mark.marksObtained}
                onChange={e => handleMarkChange(index, 'marksObtained', e.target.value)}
                max={mark.totalMarks}
                required
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
              />
              <div className="flex items-center gap-2">
                <span className="text-gray-500">/</span>
                <input
                  type="number"
                  placeholder="Total"
                  value={mark.totalMarks}
                  onChange={e => handleMarkChange(index, 'totalMarks', e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                />
                <button type="button" onClick={() => removeSubject(index)} className="text-red-500 hover:text-red-700 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                </button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addSubject} className="mt-2 px-3 py-1 text-sm font-medium text-secondary bg-secondary/10 rounded-md hover:bg-secondary/20">+ Add Subject</button>
          
          <div className="mt-6 pt-4 border-t dark:border-gray-700 flex justify-end items-center gap-6 font-semibold">
              <span>Total: {totalMarksObtained} / {totalMaxMarks}</span>
              <span>Percentage: {percentage.toFixed(2)}%</span>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md bg-gray-200 dark:bg-gray-600">Cancel</button>
          <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md disabled:bg-gray-400">
            {isSaving ? 'Saving...' : 'Save Result'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MarksEntryModal;