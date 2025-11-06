import React, { useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { db as firebaseDb } from '../../firebase-config';
import { ref, get } from "firebase/database";

type LoginMode = 'school' | 'student' | 'admin' | 'guard' | 'bus' | 'academic_work';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [mode, setMode] = useState<'school' | 'student'>('school');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [schoolId, setSchoolId] = useState('');
  const [schoolPassword, setSchoolPassword] = useState('');
  
  const [studentId, setStudentId] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [guardId, setGuardId] = useState('');
  const [guardPassword, setGuardPassword] = useState('');

  const [busId, setBusId] = useState('');
  const [busPassword, setBusPassword] = useState('');

  const [academicId, setAcademicId] = useState('');
  const [academicPassword, setAcademicPassword] = useState('');

  const { login } = useAuth();
  
  const specialLoginFor = useMemo(() => new URLSearchParams(location.search).get('for'), [location.search]);


  const performLogin = async (loginMode: LoginMode, id: string, password?: string) => {
    setLoading(true);
    setError(null);
    try {
      let user;
      if (loginMode === 'school' && password) {
        user = await api.loginSchool(id, password);
      } else if (loginMode === 'student' && password) {
        user = await api.loginStudent(id, password);
      } else if (loginMode === 'admin' && password) {
        user = await api.loginSuperAdmin(id, password);
      } else if (loginMode === 'guard' && password) {
        user = await api.loginGuard(id, password);
      } else if (loginMode === 'bus' && password) {
        user = await api.loginBus(id, password);
      } else if (loginMode === 'academic_work' && password) {
        user = await api.loginAcademicWork(id, password);
      }
      
      if(user) {
        login(user);
        // onClose(); // Do not call this. The redirect is handled by App.tsx's Navigate component.
      } else {
        throw new Error("Login failed. Please check your credentials.");
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
        
      // --- Enhanced ID Mismatch Error Handling ---
      if ((loginMode === 'school' && errorMessage.includes('अमान्य स्कूल आईडी')) || (loginMode === 'student' && errorMessage.includes('अमान्य छात्र आईडी'))) {
          const isSchoolLoginAttempt = loginMode === 'school';
          
          // Check for the other type.
          const otherTypePath = isSchoolLoginAttempt ? `students/${id}` : `schools/${id}`;
          const otherTypeLabel = isSchoolLoginAttempt ? 'Student' : 'School';

          const otherSnap = await get(ref(firebaseDb, otherTypePath));
          if (otherSnap.exists()) {
              setError(`This looks like a ${otherTypeLabel} ID. Please use the '${otherTypeLabel}' login tab.`);
              setLoading(false);
              return; // Exit with helpful error
          }
      }
      // --- Special handling for Admin login page ---
      else if (loginMode === 'admin' && errorMessage.includes('अमान्य एडमिन आईडी')) {
          const checks = [
              { path: `students/${id}`, label: 'छात्र' },
              { path: `schools/${id}`, label: 'स्कूल' },
              { path: `guards/${id}`, label: 'गार्ड' },
          ];
          for (const check of checks) {
              const snap = await get(ref(firebaseDb, check.path));
              if (snap.exists()) {
                  setError(`यह एक ${check.label} आईडी प्रतीत होती है। कृपया सही लॉगिन का उपयोग करें।`);
                  setLoading(false);
                  return;
              }
          }
      }

      // Fallback to original error handling
      if (errorMessage.startsWith('ACCOUNT_LOCKED:')) {
          setError(errorMessage.replace('ACCOUNT_LOCKED:', ''));
      } else {
          setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const role = specialLoginFor || mode;
    switch(role) {
        case 'school':
            performLogin('school', schoolId, schoolPassword);
            break;
        case 'student':
            performLogin('student', studentId, studentPassword);
            break;
        case 'guard':
            performLogin('guard', guardId, guardPassword);
            break;
        case 'bus':
            performLogin('bus', busId, busPassword);
            break;
        case 'admin':
            performLogin('admin', adminId, adminPassword);
            break;
        case 'academic_work':
            performLogin('academic_work', academicId, academicPassword);
            break;
    }
  };
  
  if (!isOpen) return null;
  
  const getTitle = () => {
      switch(specialLoginFor) {
          case 'guard': return 'Guard Sign In';
          case 'bus': return 'Bus Staff Sign In';
          case 'academic_work': return 'Academic Staff Sign In';
          case 'admin': return 'Admin Sign In';
          default: return 'Login to Your Account';
      }
  };
  
  const getSubtitle = () => {
      switch(specialLoginFor) {
          case 'guard':
          case 'bus':
          case 'academic_work':
          case 'admin':
            return 'Please enter your credentials to access.';
          default:
            return 'Welcome back! Please enter your details.';
      }
  }

  const renderFields = () => {
      const role = specialLoginFor || mode;
      switch(role) {
          case 'school':
            return (
              <>
                <div>
                  <label htmlFor="school_id" className="sr-only">School ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H5a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" /></svg>
                    </div>
                    <input id="school_id" type="text" value={schoolId} onChange={e => setSchoolId(e.target.value)} required className="mt-1 block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary" placeholder="Enter school ID"/>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <label htmlFor="school_password" className="sr-only">Password</label>
                    <Link to="#" className="text-sm font-medium text-primary hover:underline">Forgot Password?</Link>
                  </div>
                   <div className="relative mt-1">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
                     </div>
                    <input id="school_password" type="password" value={schoolPassword} onChange={e => setSchoolPassword(e.target.value)} required className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary" placeholder="••••••••"/>
                   </div>
                </div>
              </>
            );
          case 'student':
            return (
               <>
                <div>
                  <label htmlFor="student_id" className="sr-only">Student ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    </div>
                    <input id="student_id" type="text" value={studentId} onChange={e => setStudentId(e.target.value)} required className="mt-1 block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary" placeholder="Enter student ID"/>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <label htmlFor="student_password" className="sr-only">Password</label>
                     <Link to="#" className="text-sm font-medium text-primary hover:underline">Forgot Password?</Link>
                  </div>
                  <div className="relative mt-1">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
                     </div>
                    <input id="student_password" type="password" value={studentPassword} onChange={e => setStudentPassword(e.target.value)} required className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary focus:border-primary" placeholder="••••••••"/>
                  </div>
                </div>
              </>
            );
          case 'guard':
            return (
               <>
                <div>
                  <label htmlFor="guard_id" className="sr-only">Guard ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    </div>
                    <input id="guard_id" type="text" value={guardId} onChange={e => setGuardId(e.target.value)} required className="mt-1 block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm" placeholder="Enter Guard ID"/>
                  </div>
                </div>
                <div>
                  <label htmlFor="guard_password" className="sr-only">Password</label>
                  <div className="relative mt-1">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
                     </div>
                    <input id="guard_password" type="password" value={guardPassword} onChange={e => setGuardPassword(e.target.value)} required className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm" placeholder="••••••••"/>
                  </div>
                </div>
              </>
            );
          case 'bus':
            return (
               <>
                <div>
                  <label htmlFor="bus_id" className="sr-only">Bus Staff ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    </div>
                    <input id="bus_id" type="text" value={busId} onChange={e => setBusId(e.target.value)} required className="mt-1 block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm" placeholder="Enter Bus Staff ID"/>
                  </div>
                </div>
                <div>
                  <label htmlFor="bus_password" className="sr-only">Password</label>
                  <div className="relative mt-1">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
                     </div>
                    <input id="bus_password" type="password" value={busPassword} onChange={e => setBusPassword(e.target.value)} required className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm" placeholder="••••••••"/>
                  </div>
                </div>
              </>
            );
          case 'academic_work':
            return (
               <>
                <div>
                  <label htmlFor="academic_id" className="sr-only">Academic Staff ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    </div>
                    <input id="academic_id" type="text" value={academicId} onChange={e => setAcademicId(e.target.value)} required className="mt-1 block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm" placeholder="Enter Staff ID"/>
                  </div>
                </div>
                <div>
                  <label htmlFor="academic_password" className="sr-only">Password</label>
                  <div className="relative mt-1">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>
                     </div>
                    <input id="academic_password" type="password" value={academicPassword} onChange={e => setAcademicPassword(e.target.value)} required className="block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm" placeholder="••••••••"/>
                  </div>
                </div>
              </>
            );
          case 'admin':
             return (
                <>
                  <div>
                    <label htmlFor="admin_id" className="sr-only">Admin ID</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                      </div>
                      <input id="admin_id" type="text" value={adminId} onChange={e => setAdminId(e.target.value)} required className="mt-1 block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm" placeholder="Enter Admin ID"/>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="admin_password" className="sr-only">Admin Password</label>
                     <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>
                       </div>
                      <input id="admin_password" type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required className="mt-1 block w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm" placeholder="••••••••"/>
                     </div>
                  </div>
                </>
             );
      }
  }


  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md relative"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-8 md:p-10 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {getTitle()}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  {getSubtitle()}
                </p>
            </div>
            
            {!specialLoginFor && (
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                    onClick={() => setMode('school')}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors duration-300 focus:outline-none ${mode === 'school' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary'}`}
                    >
                    School
                    </button>
                    <button
                    onClick={() => setMode('student')}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors duration-300 focus:outline-none ${mode === 'student' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary'}`}
                    >
                    Student
                    </button>
                </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-6">
              {renderFields()}
              
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              <div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus disabled:bg-indigo-300 dark:disabled:bg-indigo-800 transition-transform transform hover:scale-105">
                  {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Sign In'}
                </button>
              </div>
            </form>
            
            {!specialLoginFor && (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    New to NotifyEdu? <Link to="/get-started" onClick={onClose} className="font-medium text-primary hover:underline">Get Started</Link>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;