import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Complaint, ComplaintStatus } from '../../types';
import { notificationService } from '../../services/notificationService';

interface ComplaintsManagerProps {
    schoolId: string;
}

const ComplaintsManager: React.FC<ComplaintsManagerProps> = ({ schoolId }) => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchComplaints = useCallback(async () => {
        if (user) {
            setLoading(true);
            setError(null);
            try {
                const fetchedComplaints = await api.getComplaints(schoolId, user.token);
                setComplaints(fetchedComplaints);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }
    }, [user, schoolId]);

    useEffect(() => {
        fetchComplaints();
    }, [fetchComplaints]);

    const handleResolve = async (complaintId: string) => {
        if (!user) return;
        const originalComplaints = [...complaints];
        const complaintToResolve = complaints.find(c => c.complaint_id === complaintId);
        // Optimistically update UI
        setComplaints(complaints.map(c => c.complaint_id === complaintId ? { ...c, status: ComplaintStatus.RESOLVED } : c));
        
        try {
            await api.resolveComplaint(schoolId, user.token, complaintId);
            if (complaintToResolve) {
                notificationService.show('Complaint Resolved', {
                    body: `The complaint from ${complaintToResolve.student_name} has been marked as resolved.`
                }, 'complaint');
            }
        } catch (err) {
            setError("Failed to update status. Please try again.");
            // Revert on failure
            setComplaints(originalComplaints);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-200 p-4 rounded-lg">{error}</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-neutral dark:text-gray-200 mb-4">Parent/Student Complaints</h2>
            {complaints.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">No complaints have been submitted.</p>
            ) : (
                <div className="space-y-4">
                    {complaints.map(complaint => (
                        <div key={complaint.complaint_id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg shadow-sm border-l-4 dark:border-gray-600">
                           <div className="flex justify-between items-start flex-wrap gap-2">
                                <div>
                                    <p className="font-semibold text-neutral dark:text-gray-200">
                                        About: {complaint.student_name} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({complaint.student_id})</span>
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                        Submitted by {complaint.submitted_by_role}: {complaint.submitted_by_name} on {new Date(complaint.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                {complaint.status === ComplaintStatus.OPEN ? (
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">OPEN</span>
                                ) : (
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200">RESOLVED</span>
                                )}
                           </div>
                           <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{complaint.text}</p>
                           {complaint.status === ComplaintStatus.OPEN && (
                               <div className="mt-3 text-right">
                                   <button 
                                     onClick={() => handleResolve(complaint.complaint_id)}
                                     className="px-3 py-1 text-xs bg-secondary text-white font-semibold rounded-md shadow-sm hover:bg-secondary-hover focus:outline-none"
                                   >
                                       Mark as Resolved
                                   </button>
                               </div>
                           )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ComplaintsManager;