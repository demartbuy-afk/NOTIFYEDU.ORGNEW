import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Student, CLASS_NAMES } from '../../types';
import { QRCodeSVG } from 'qrcode.react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  token: string;
  onStudentAdded: (student: Student) => void;
}

type ModalStep = 'details' | 'success';

const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, schoolId, token, onStudentAdded }) => {
  const [name, setName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [isCustomClass, setIsCustomClass] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [isIdManuallyEdited, setIsIdManuallyEdited] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState<Student | null>(null);
  const [step, setStep] = useState<ModalStep>('details');
  
  const generateSuggestedPassword = () => Math.random().toString(36).slice(-8);

  useEffect(() => {
    if (name.trim() && !isIdManuallyEdited) {
      const sanitizedName = name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      const randomSuffix = Math.random().toString(36).slice(2, 6);
      setStudentId(`stu_${sanitizedName}_${randomSuffix}`);
    }
  }, [name, isIdManuallyEdited]);

  useEffect(() => {
    if (isOpen && step === 'details') {
      setPassword(generateSuggestedPassword());
    }
  }, [isOpen, step]);

  const resetForm = () => {
    setName('');
    setParentPhone('');
    setRollNo('');
    setStudentClass('');
    setIsCustomClass(false);
    setStudentId('');
    setPassword('');
    setIsIdManuallyEdited(false);
    setLoading(false);
    setError(null);
    setNewStudent(null);
    setStep('details');
  }

  const handleClose = () => {
    resetForm();
    onClose();
  }

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'OTHER') {
        setIsCustomClass(true);
        setStudentClass('');
    } else {
        setIsCustomClass(false);
        setStudentClass(value);
    }
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !parentPhone.trim() || !rollNo.trim() || !studentClass.trim() || !studentId.trim() || !password.trim()) {
        setError("Please fill out all fields before adding a student.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const studentDetails = { name, parentPhone, roll_no: rollNo, class: studentClass, student_id: studentId, password_auto: password };
      const student = await api.addStudent(schoolId, token, studentDetails);
      setNewStudent(student);
      onStudentAdded(student); // Add to list in background
      setStep('success'); // Go directly to success
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;

  const renderContent = () => {
    switch (step) {
      case 'details':
        return (
          <form onSubmit={handleSubmitDetails} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Student Name</label>
                <input
                  type="text"
                  id="studentName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Roll No.</label>
                <input
                  type="text"
                  id="rollNo"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="studentClassSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Class</label>
                <select
                  id="studentClassSelect"
                  value={isCustomClass ? 'OTHER' : studentClass}
                  onChange={handleClassChange}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">-- Select a Class --</option>
                  {CLASS_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
                  <option value="OTHER">Other (Specify)</option>
                </select>
                {isCustomClass && (
                  <input
                    type="text"
                    id="customStudentClass"
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    required
                    placeholder='Enter custom class name, e.g., 10th A'
                    className="mt-2 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                  />
                )}
              </div>
               <div>
                <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Parent's Mobile No.</label>
                <input
                  type="tel"
                  id="parentPhone"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="+919876543210"
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <div className="pt-2">
                 <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Student ID (Editable)</label>
                 <input
                     type="text"
                     id="studentId"
                     value={studentId}
                     onChange={(e) => {
                         setStudentId(e.target.value);
                         setIsIdManuallyEdited(true);
                     }}
                     required
                     className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                 />
             </div>
             <div>
                 <label htmlFor="studentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password (Editable)</label>
                 <div className="relative mt-1">
                     <input
                         type="text"
                         id="studentPassword"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         required
                         className="block w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary"
                     />
                     <button
                         type="button"
                         onClick={() => setPassword(generateSuggestedPassword())}
                         className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-primary hover:text-primary-focus focus:outline-none"
                         aria-label="Regenerate password"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                     </button>
                 </div>
             </div>
            {error && <p className="text-red-500 text-sm pt-2">{error}</p>}
          </form>
        );
      case 'success':
        if (!newStudent) return null;
        return (
           <div className="text-center space-y-4">
                <div className="flex justify-center bg-white p-2 rounded-lg">
                    <QRCodeSVG value={newStudent.qr_value} size={128} level="H" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Download or screenshot this QR code for the student's ID card.</p>
                <div className="text-left bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2 text-gray-800 dark:text-gray-200">
                    <p><strong>Name:</strong> {newStudent.name}</p>
                    <p><strong>Student ID:</strong> <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{newStudent.student_id}</code></p>
                    <p><strong>Password:</strong> <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{newStudent.password_auto}</code></p>
                    <p><strong>Fingerprint Enrollment:</strong> <span className="font-semibold text-gray-500 dark:text-gray-400">Coming Soon</span></p>
                </div>
            </div>
        )
      default:
        return null;
    }
  }

   const renderButtons = () => {
    switch(step) {
      case 'details':
        return (
          <>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmitDetails}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus disabled:bg-indigo-300 dark:disabled:bg-indigo-800"
            >
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </>
        );
      case 'success':
         return (
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus"
            >
              Done
            </button>
          );
    }
   }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
            {step === 'details' && 'Add New Student'}
            {step === 'success' && 'Student Added Successfully'}
          </h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {renderContent()}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-3">
          {renderButtons()}
        </div>
      </div>
    </div>
  );
};

export default AddStudentModal;