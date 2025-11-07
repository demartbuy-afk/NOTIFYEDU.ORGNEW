import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ContactInfo } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface AdminSettingsManagerProps {
    showToast: (message: string) => void;
}

const AdminSettingsManager: React.FC<AdminSettingsManagerProps> = ({ showToast }) => {
    const { user } = useAuth();
    const [contactInfo, setContactInfo] = useState<ContactInfo>({ title: '', description: '', email: '', phone: ''});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchInfo = async () => {
            setLoading(true);
            try {
                const data = await api.getContactInfo();
                if (data) setContactInfo(data);
            } catch (e) {
                console.error("Failed to fetch contact info");
            } finally {
                setLoading(false);
            }
        };
        fetchInfo();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            showToast("Authentication error.");
            return;
        }
        setSaving(true);
        try {
            await api.updateContactInfo(user.token, contactInfo);
            showToast("Contact information updated successfully.");
        } catch (err) {
            showToast(`Error: ${(err as Error).message}`);
        } finally {
            setSaving(false);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setContactInfo(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-neutral dark:text-gray-200 mb-4">Public Business Information</h2>
            <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This information will be displayed on public-facing pages like the Agent Profile and School Registration pages.</p>
                    <div className="space-y-4">
                        <div>
                           <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Name / Title</label>
                           <input type="text" name="title" id="title" value={contactInfo.title} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                           <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Address / Details</label>
                           <textarea name="description" id="description" rows={3} value={contactInfo.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                               <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Email</label>
                               <input type="email" name="email" id="email" value={contactInfo.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                               <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Phone</label>
                               <input type="tel" name="phone" id="phone" value={contactInfo.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <button type="submit" disabled={saving} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75 disabled:bg-gray-400">
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettingsManager;