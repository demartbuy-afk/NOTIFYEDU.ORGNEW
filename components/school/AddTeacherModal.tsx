import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Teacher } from '../../types';
import { QRCodeSVG } from 'qrcode.react';

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  token: string;
  onTeacherAdded: (teacher: Teacher) => void;
}

type ModalStep = 'details' | 'success';

const AddTeacherModal: React.FC<AddTeacherModalProps> = ({ isOpen, onClose, schoolId, token, onTeacherAdded }) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [isIdManuallyEdited, setIsIdManuallyEdited] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTeacher, setNewTeacher] = useState<Teacher | null>(null);
  const [step, setStep] = useState<ModalStep>('details');
  
  useEffect(() => {
    if (name.trim() && !isIdManuallyEdited) {
      const sanitizedName = name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      const randomSuffix = Math.random().toString(36).slice(2, 6);
      setTeacherId(`teach_${sanitizedName}_${randomSuffix}`);
    }
  }, [name, isIdManuallyEdited]);

  const resetForm = () => {
    setName('');
    setSubject('');
    setPhoneNumber('');
    setTeacherId('');
    setIsIdManuallyEdited(false);
    setLoading(false);
    setError(null);
    setNewTeacher(null);
    setStep('details');
  }

  const handleClose = () => {
    resetForm();
    onClose();
  }

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim() || !phoneNumber.trim() || !teacherId.trim()) {
        setError("Please fill out all fields.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const teacherDetails = { name, subject, phone_number: phoneNumber, teacher_id: teacherId };
      const teacher = await api.addTeacher(schoolId, token, teacherDetails);
      setNewTeacher(teacher);
      onTeacherAdded(teacher);
      setStep('success');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
            {step === 'details' ? 'Add New Teacher' : 'Teacher Added Successfully'}
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {step === 'details' ? (
            <form onSubmit={handleSubmitDetails} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="teacherName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teacher Name</label>
                  <input
                    type="text"
                    id="teacherName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                  />
                </div>
              </div>
               <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+919876543210"
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                  />
                </div>
              <div className="pt-2">
                   <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Teacher ID (Editable)</label>
                   <input
                       type="text"
                       id="teacherId"
                       value={teacherId}
                       onChange={(e) => {
                           setTeacherId(e.target.value);
                           setIsIdManuallyEdited(true);
                       }}
                       required
                       className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm"
                   />
               </div>
              {error && <p className="text-red-500 text-sm pt-2">{error}</p>}
            </form>
          ) : (
            newTeacher && (
                <div className="text-center space-y-4">
                     <div className="flex justify-center bg-white p-2 rounded-lg">
                         <QRCodeSVG value={newTeacher.qr_value} size={128} level="H" />
                     </div>
                     <p className="text-sm text-gray-600 dark:text-gray-400">Download or screenshot this QR code for the teacher's ID card.</p>
                     <div className="text-left bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2 text-gray-800 dark:text-gray-200">
                         <p><strong>Name:</strong> {newTeacher.name}</p>
                         <p><strong>Teacher ID:</strong> <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{newTeacher.teacher_id}</code></p>
                     </div>
                 </div>
             )
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-3">
          {step === 'details' ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmitDetails}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary-hover disabled:bg-indigo-300"
              >
                {loading ? 'Adding...' : 'Add Teacher'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTeacherModal;