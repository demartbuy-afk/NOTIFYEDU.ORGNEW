import React, { useState } from 'react';
import { Teacher } from '../../types';
import TeacherList from './TeacherList';
import ViewTeacherQrModal from './ViewTeacherQrModal';
import TeacherAttendanceHistoryModal from './TeacherAttendanceHistoryModal';

interface TeacherManagerProps {
  teachers: Teacher[];
}

const TeacherManager: React.FC<TeacherManagerProps> = ({ teachers }) => {
  const [viewingQrTeacher, setViewingQrTeacher] = useState<Teacher | null>(null);
  const [viewingHistoryTeacher, setViewingHistoryTeacher] = useState<Teacher | null>(null);

  return (
    <>
        <div>
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-neutral dark:text-gray-200">Manage Teachers</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Add, view, and manage teachers for your school.</p>
            </div>
            <TeacherList 
                teachers={teachers} 
                onViewQr={setViewingQrTeacher}
                onViewHistory={setViewingHistoryTeacher}
            />
        </div>

        {viewingQrTeacher && (
            <ViewTeacherQrModal 
                isOpen={!!viewingQrTeacher}
                onClose={() => setViewingQrTeacher(null)}
                teacher={viewingQrTeacher}
            />
        )}

        {viewingHistoryTeacher && (
            <TeacherAttendanceHistoryModal
                isOpen={!!viewingHistoryTeacher}
                onClose={() => setViewingHistoryTeacher(null)}
                teacher={viewingHistoryTeacher}
            />
        )}
    </>
  );
};

export default TeacherManager;