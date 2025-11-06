import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { PaymentProof, PaymentProofStatus, School } from '../../types';

interface PaymentProofsManagerProps {
  onUpdateStudents: () => void;
  showToast: (message: string) => void;
  school: School;
}

const PaymentProofsManager: React.FC<PaymentProofsManagerProps> = ({ onUpdateStudents, showToast, school }) => {
    const { user } = useAuth();
    const [proofs, setProofs] = useState<PaymentProof[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchProofs = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const data = await api.getPaymentProofs(school.id, user.token);
            setProofs(data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, [user, school.id]);

    useEffect(() => {
        fetchProofs();
    }, [fetchProofs]);

    const handleAction = async (proofId: string, action: 'approve' | 'reject') => {
        if (!user) return;
        setActionLoading(proofId);
        try {
            if (action === 'approve') {
                await api.approvePaymentProof(user.token, proofId);
                showToast("Payment approved and student's fees updated.");
                onUpdateStudents(); // To refresh student list with updated fee data
            } else {
                await api.rejectPaymentProof(user.token, proofId);
                showToast("Payment proof rejected.");
            }
            fetchProofs(); // Refetch proofs to update the list
        } catch (err) {
            showToast(`Error: ${(err as Error).message}`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-200 p-4 rounded-lg">{error}</div>;
    }

    const pendingProofs = proofs.filter(p => p.status === PaymentProofStatus.PENDING);
    const processedProofs = proofs.filter(p => p.status !== PaymentProofStatus.PENDING);

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-neutral dark:text-gray-200 mb-4">Pending Verifications</h3>
                {pendingProofs.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No pending payment proofs.</p>
                ) : (
                    <div className="space-y-4">
                        {pendingProofs.map(proof => (
                            <div key={proof.proof_id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2 space-y-2">
                                        <p><strong>Student:</strong> {proof.student_name} ({proof.student_id})</p>
                                        <p><strong>Payer:</strong> {proof.payer_name}</p>
                                        <p><strong>Transaction ID:</strong> <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{proof.transaction_id}</code></p>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-2xl font-bold text-primary">₹{proof.amount.toLocaleString()}</p>
                                        <p className="text-xs text-gray-400">{new Date(proof.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t dark:border-gray-600 flex justify-end gap-3">
                                    <button onClick={() => handleAction(proof.proof_id, 'reject')} disabled={!!actionLoading} className="px-3 py-1 text-sm font-semibold text-red-700 bg-red-100 rounded-md hover:bg-red-200 disabled:opacity-50">Reject</button>
                                    <button onClick={() => handleAction(proof.proof_id, 'approve')} disabled={!!actionLoading} className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50">
                                        {actionLoading === proof.proof_id ? '...' : 'Approve'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

             <div>
                <h3 className="text-xl font-bold text-neutral dark:text-gray-200 mb-4">Processed History</h3>
                 {processedProofs.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No processed payment proofs yet.</p>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                         {processedProofs.map(proof => (
                            <div key={proof.proof_id} className={`p-3 rounded-md flex justify-between items-center ${proof.status === 'APPROVED' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                <div>
                                    <p className="text-sm font-medium">{proof.student_name} - ₹{proof.amount}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(proof.timestamp).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${proof.status === 'APPROVED' ? 'text-green-800' : 'text-red-800'}`}>
                                    {proof.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentProofsManager;