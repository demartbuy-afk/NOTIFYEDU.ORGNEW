import React, { useState, useRef } from 'react';
import { api } from '../../services/api';
import { Agent } from '../../types';
import { blobToBase64 } from '../../utils/fileUtils';
import { QRCodeSVG } from 'qrcode.react';

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onAgentAdded: (agent: Agent) => void;
}

const AddAgentModal: React.FC<AddAgentModalProps> = ({ isOpen, onClose, token, onAgentAdded }) => {
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newAgent, setNewAgent] = useState<Agent | null>(null);
    const [step, setStep] = useState<'details' | 'success'>('details');

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
            try {
                const base64 = await blobToBase64(file);
                setPhoto(base64);
            } catch (err) {
                setError("Failed to read image file.");
                setPhoto(null);
                setPhotoPreview(null);
            }
        }
    };

    const resetForm = () => {
        setName('');
        setContent('');
        setPhoto(null);
        setPhotoPreview(null);
        setLoading(false);
        setError(null);
        setNewAgent(null);
        setStep('details');
    };

    const handleClose = () => {
        resetForm();
        onClose();
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
            const agent = await api.addAgent(token, { name, content, photoBase64: photo });
            onAgentAdded(agent);
            setNewAgent(agent);
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
                        {step === 'success' ? 'Agent Added Successfully' : 'Add New Agent'}
                    </h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
                </div>
                <div className="p-6">
                    {step === 'details' ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    )}
                                </div>
                                <div>
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">
                                        Upload Photo
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 1MB.</p>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="agentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agent Name</label>
                                <input type="text" id="agentName" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                            </div>
                             <div>
                                <label htmlFor="agentContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agent Content/Bio</label>
                                <textarea id="agentContent" rows={3} value={content} onChange={e => setContent(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm" />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                        </form>
                    ) : (
                         newAgent && (
                            <div className="text-center space-y-4">
                                <div className="flex justify-center bg-white p-2 rounded-lg">
                                    <QRCodeSVG value={newAgent.qrValue} size={128} level="H" />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Scan this QR code to view the agent's public profile.</p>
                            </div>
                        )
                    )}
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end space-x-3">
                    {step === 'details' ? (
                        <>
                            <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">Cancel</button>
                            <button type="submit" onClick={handleSubmit} disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md shadow-sm hover:bg-primary-hover disabled:bg-indigo-300">{loading ? 'Adding...' : 'Add Agent'}</button>
                        </>
                    ) : (
                        <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover">Done</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddAgentModal;