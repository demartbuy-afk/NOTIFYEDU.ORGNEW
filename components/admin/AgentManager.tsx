import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Agent } from '../../types';
import AgentList from './AgentList';
import AddAgentModal from './AddAgentModal';
import EditAgentModal from './EditAgentModal';
import ViewAgentQrModal from './ViewAgentQrModal';

interface AgentManagerProps {
    agents: Agent[];
    onAgentAdded: (agent: Agent) => void;
    onAgentUpdated: (agent: Agent) => void;
    onAgentDeleted: (agentId: string) => void;
}

const AgentManager: React.FC<AgentManagerProps> = ({ agents, onAgentAdded, onAgentUpdated, onAgentDeleted }) => {
    const { user } = useAuth();
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [viewingQrAgent, setViewingQrAgent] = useState<Agent | null>(null);

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral dark:text-gray-200">Agent Management</h2>
                <button onClick={() => setAddModalOpen(true)} className="px-4 py-2 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-hover">
                    + Add Agent
                </button>
            </div>
            
            <AgentList 
                agents={agents}
                onEdit={setEditingAgent}
                onViewQr={setViewingQrAgent}
                onDelete={onAgentDeleted}
            />

            {user && isAddModalOpen && (
                <AddAgentModal
                    isOpen={isAddModalOpen}
                    onClose={() => setAddModalOpen(false)}
                    token={user.token}
                    onAgentAdded={onAgentAdded}
                />
            )}
            
            {user && editingAgent && (
                <EditAgentModal
                    isOpen={!!editingAgent}
                    onClose={() => setEditingAgent(null)}
                    token={user.token}
                    agent={editingAgent}
                    onAgentUpdated={onAgentUpdated}
                />
            )}

            {viewingQrAgent && (
                <ViewAgentQrModal
                    isOpen={!!viewingQrAgent}
                    onClose={() => setViewingQrAgent(null)}
                    agent={viewingQrAgent}
                />
            )}
        </>
    );
};

export default AgentManager;