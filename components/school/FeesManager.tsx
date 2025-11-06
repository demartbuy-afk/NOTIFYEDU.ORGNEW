import React, { useState, useMemo } from 'react';
import { Student, School } from '../../types';
import RecordPaymentModal from './RecordPaymentModal';
import PaymentProofsManager from './PaymentProofsManager';

interface FeesManagerProps {
  students: Student[];
  onUpdateStudents: () => void;
  onUpdateSchool: (updatedSchool: School) => void;
  showToast: (message: string) => void;
  school: School;
}

const FeeSummaryCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center space-x-4">
        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-neutral dark:text-gray-200">{value}</p>
        </div>
    </div>
);


const FeesManager: React.FC<FeesManagerProps> = ({ students, onUpdateStudents, showToast, school, onUpdateSchool }) => {
    const [managingStudent, setManagingStudent] = useState<Student | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [classFilter, setClassFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeTab, setActiveTab] = useState<'all' | 'defaulters' | 'proofs'>('all');

    const handleSuccess = () => {
        if (!managingStudent) return;
        showToast(`Fees updated for ${managingStudent.name}.`);
        setManagingStudent(null);
        onUpdateStudents();
    };
    
    const summaryData = useMemo(() => {
        const totalCollectable = students.reduce((sum, s) => sum + (s.total_fees || 0), 0);
        const totalCollected = students.reduce((sum, s) => sum + (s.fees_paid || 0), 0);
        const outstandingDues = totalCollectable - totalCollected;
        const collectionPercentage = totalCollectable > 0 ? Math.round((totalCollected / totalCollectable) * 100) : 0;
        return { totalCollectable, totalCollected, outstandingDues, collectionPercentage };
    }, [students]);

    const uniqueClasses = useMemo(() => ['all', ...Array.from(new Set(students.map(s => s.class)))], [students]);

    const getFeeStatus = (student: Student) => {
        const total = student.total_fees || 0;
        const paid = student.fees_paid || 0;
        if (total <= 0) return 'na';
        if (paid >= total) return 'paid';
        if (paid <= 0) return 'unpaid';
        return 'partial';
    };

    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const status = getFeeStatus(student);
            const balance = (student.total_fees || 0) - (student.fees_paid || 0);

            if (activeTab === 'defaulters' && balance <= 0) return false;
            if (statusFilter !== 'all' && status !== statusFilter) return false;
            if (classFilter !== 'all' && student.class !== classFilter) return false;
            if (searchQuery && !student.name.toLowerCase().includes(searchQuery.toLowerCase()) && !student.roll_no.includes(searchQuery)) return false;
            
            return true;
        });
    }, [students, searchQuery, classFilter, statusFilter, activeTab]);


    const getFeeStatusPill = (student: Student) => {
        const total = student.total_fees || 0;
        const paid = student.fees_paid || 0;
        const status = getFeeStatus(student);

        const statusMap: Record<string, { text: string, classes: string }> = {
            paid: { text: 'Paid', classes: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
            unpaid: { text: 'Unpaid', classes: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
            partial: { text: 'Partial', classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
            na: { text: 'N/A', classes: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200' }
        };
        const { text, classes } = statusMap[status];

        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${classes}`}>{text}</span>;
    };


    return (
        <div>
            <h2 className="text-2xl font-bold text-neutral dark:text-gray-200 mb-6">Fees Dashboard</h2>

            {/* Summary Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <FeeSummaryCard title="Total Collectable" value={`₹${summaryData.totalCollectable.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <FeeSummaryCard title="Total Collected" value={`₹${summaryData.totalCollected.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <FeeSummaryCard title="Outstanding Dues" value={`₹${summaryData.outstandingDues.toLocaleString()}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Collection Rate</p>
                    <p className="text-2xl font-bold text-neutral dark:text-gray-200">{summaryData.collectionPercentage}%</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mt-2">
                        <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${summaryData.collectionPercentage}%` }}></div>
                    </div>
                </div>
            </div>
            
            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    <button onClick={() => setActiveTab('all')} className={`${activeTab === 'all' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>All Students</button>
                    <button onClick={() => setActiveTab('defaulters')} className={`${activeTab === 'defaulters' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Defaulters</button>
                    <button onClick={() => setActiveTab('proofs')} className={`${activeTab === 'proofs' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>Payment Proofs</button>
                </nav>
            </div>

            {activeTab === 'proofs' ? (
                <PaymentProofsManager onUpdateStudents={onUpdateStudents} showToast={showToast} school={school} />
            ) : (
                <>
                    {/* Filters */}
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="text" placeholder="Search by name or roll no..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                            <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                                {uniqueClasses.map(c => <option key={c} value={c}>{c === 'all' ? 'All Classes' : c}</option>)}
                            </select>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                                <option value="all">All Statuses</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                                <option value="partial">Partial</option>
                            </select>
                        </div>
                    </div>
                    {/* Student List Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fee Progress</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Balance</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredStudents.map((student) => {
                                const total = student.total_fees || 0;
                                const paid = student.fees_paid || 0;
                                const balance = total - paid;
                                const percentage = total > 0 ? (paid / total) * 100 : (paid > 0 ? 100 : 0);

                                return (
                                    <tr key={student.student_id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{student.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Class: {student.class}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                                    <div className="bg-secondary h-2.5 rounded-full" style={{width: `${percentage}%`}}></div>
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{Math.round(percentage)}%</span>
                                            </div>
                                             <div className="text-xs text-gray-500 dark:text-gray-400">
                                                ₹{paid.toLocaleString()} / ₹{total.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-300'}`}>
                                            ₹{balance.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            {getFeeStatusPill(student)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            <button onClick={() => setManagingStudent(student)} className="px-3 py-1 text-xs bg-primary text-white font-semibold rounded-md shadow-sm hover:bg-primary-hover focus:outline-none">
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                         {filteredStudents.length === 0 && (
                            <p className="text-center py-8 text-gray-500 dark:text-gray-400">No students match the current filters.</p>
                        )}
                    </div>
                </>
            )}

            {managingStudent && (
                <RecordPaymentModal
                    isOpen={!!managingStudent}
                    onClose={() => setManagingStudent(null)}
                    student={managingStudent}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
};

export default FeesManager;