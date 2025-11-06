import React from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Agent } from '../../types';

interface AgentListProps {
    agents: Agent[];
    onEdit: (agent: Agent) => void;
    onViewQr: (agent: Agent) => void;
    onDelete: (agentId: string) => void;
}

const AgentList: React.FC<AgentListProps> = ({ agents, onEdit, onViewQr, onDelete }) => {
    const { user } = useAuth();

    const handleDelete = async (agent: Agent) => {
        if (!user || !window.confirm(`Are you sure you want to delete agent ${agent.name}?`)) return;
        try {
            await api.deleteAgent(user.token, agent.id);
            onDelete(agent.id);
        } catch (error) {
            console.error("Failed to delete agent", error);
            alert((error as Error).message);
        }
    };

    if (agents.length === 0) {
        return <p className="text-center text-gray-500 dark:text-gray-400 py-4">No agents found. Add one to get started.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Agent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Content</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {agents.map(agent => (
                        <tr key={agent.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        <img className="h-10 w-10 rounded-full object-cover" src={`data:image/png;base64,${agent.photoBase64}`} alt="" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{agent.name}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-600 dark:text-gray-300 max-w-sm truncate">{agent.content}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                <div className="flex justify-center items-center space-x-4">
                                    <button onClick={() => onViewQr(agent)} className="text-gray-500 hover:text-primary">QR Code</button>
                                    <button onClick={() => onEdit(agent)} className="text-primary hover:text-primary-focus">Edit</button>
                                    <button onClick={() => handleDelete(agent)} className="text-red-600 hover:text-red-800">Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AgentList;