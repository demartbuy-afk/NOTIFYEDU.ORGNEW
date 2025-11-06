import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import { Agent } from '../../types';
import { blobToBase64 } from '../../utils/fileUtils';

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  agent: Agent;
  onAgentUpdated: (agent: Agent) => void;
}

const EditAgentModal: React.FC<EditAgentModalProps> = ({ isOpen, onClose, token, agent, onAgentUpdated }) => {
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if(agent) {
            setName(agent.name);
            setContent(agent.content);
            setPhoto(agent.photoBase64);
            setPhotoPreview(`data:image/png;base64,${agent.photoBase64}`);
        }
    }, [agent]);

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
            try {
                const base64 = await blobToBase64(file);
                setPhoto(base64);
            } catch (err) {
                setError("Failed to read image file.");
                setPhoto(agent.photoBase64);
                setPhotoPreview(`data:image/png;base64,${agent.photoBase64}`);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !content || !photo) {
            setError("All fields, including a photo, are required.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const updatedAgent = await api.updateAgent(token, agent.id, { name, content, photoBase64: photo });
            onAgentUpdated(updatedAgent);
            onClose();
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
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">Edit Agent</h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                {photoPreview && <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />}
                            </div>
                            <div>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">
                                    Change Photo
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="agentNameEdit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agent Name</label>
                            <input type="text" id="agentNameEdit" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                        </div>
                         <div>
                            <label htmlFor="agentContentEdit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agent Content/Bio</label>
                            <textarea id="agentContentEdit" rows={3} value={content} onChange={e => setContent(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary-hover disabled:bg-indigo-300">{loading ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAgentModal;