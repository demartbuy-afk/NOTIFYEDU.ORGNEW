import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FooterInfo, NavLink } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface FooterSettingsManagerProps {
    showToast: (message: string) => void;
}

const FooterSettingsManager: React.FC<FooterSettingsManagerProps> = ({ showToast }) => {
    const { user } = useAuth();
    const [footerInfo, setFooterInfo] = useState<FooterInfo>({ navLinks: [], email: '', phone: '', copyright: ''});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchInfo = async () => {
            setLoading(true);
            try {
                const data = await api.getFooterInfo();
                if (data) {
                    setFooterInfo(data);
                } else {
                    // Fallback data
                     setFooterInfo({
                        navLinks: [
                            { title: 'Features', href: '#features' },
                            { title: 'How It Works', href: '#how-it-works' },
                            { title: 'Teachers', href: '/teacher-portal' },
                            { title: 'Contact', href: '#contact' },
                        ],
                        email: 'help@notifyedu.com',
                        phone: '+91 99999 88888',
                        copyright: '© {year} NotifyEdu. All rights reserved.',
                    });
                }
            } catch (e) {
                console.error("Failed to fetch footer info");
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
            await api.updateFooterInfo(user.token, footerInfo);
            showToast("Footer information updated successfully.");
        } catch (err) {
            showToast(`Error: ${(err as Error).message}`);
        } finally {
            setSaving(false);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFooterInfo(prev => ({ ...prev, [name]: value }));
    };
    
    const handleLinkChange = (index: number, field: keyof NavLink, value: string) => {
        const newLinks = [...footerInfo.navLinks];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setFooterInfo(prev => ({ ...prev, navLinks: newLinks }));
    };

    const handleAddLink = () => {
        setFooterInfo(prev => ({
            ...prev,
            navLinks: [...prev.navLinks, { title: '', href: '' }]
        }));
    };

    const handleRemoveLink = (index: number) => {
        setFooterInfo(prev => ({
            ...prev,
            navLinks: prev.navLinks.filter((_, i) => i !== index)
        }));
    };

    if (loading) {
        return <p>Loading footer settings...</p>
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-neutral dark:text-gray-200 mb-4">Footer Settings</h2>
            <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
                {/* Nav Links */}
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-neutral dark:text-gray-100 mb-2">Navigation Links</h3>
                    <div className="space-y-3">
                        {footerInfo.navLinks.map((link, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="text" placeholder="Title" value={link.title} onChange={(e) => handleLinkChange(index, 'title', e.target.value)} className="flex-1 mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary" />
                                <input type="text" placeholder="URL or #id" value={link.href} onChange={(e) => handleLinkChange(index, 'href', e.target.value)} className="flex-1 mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary" />
                                <button type="button" onClick={() => handleRemoveLink(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={handleAddLink} className="mt-3 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20">
                        + Add Link
                    </button>
                </div>

                {/* Contact and Copyright */}
                 <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Email</label>
                           <input type="email" name="email" id="email" value={footerInfo.email} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                           <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Phone</label>
                           <input type="tel" name="phone" id="phone" value={footerInfo.phone} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                     </div>
                     <div>
                        <label htmlFor="copyright" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Copyright Text</label>
                        <input type="text" name="copyright" id="copyright" value={footerInfo.copyright} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-primary focus:border-primary" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Use {'{year}'} as a placeholder for the current year.</p>
                     </div>
                 </div>

                <div className="text-right">
                    <button type="submit" disabled={saving} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75 disabled:bg-gray-400">
                        {saving ? 'Saving...' : 'Save Footer Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FooterSettingsManager;