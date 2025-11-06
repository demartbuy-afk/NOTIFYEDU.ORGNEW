import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnimatedLogo from './AnimatedLogo';
import { api } from '../../services/api';
import { FooterInfo } from '../../types';

const Footer: React.FC = () => {
    const [footerInfo, setFooterInfo] = useState<FooterInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFooterInfo = async () => {
            try {
                const data = await api.getFooterInfo();
                setFooterInfo(data);
            } catch (error) {
                console.error("Failed to fetch footer info:", error);
                // Set default data on error so the footer doesn't break
                setFooterInfo({
                    navLinks: [
                        { title: 'Features', href: '#features' },
                        { title: 'How It Works', href: '#how-it-works' },
                        { title: 'Teachers', href: '/teacher-portal' },
                        { title: 'Contact', href: '#contact' },
                    ],
                    email: 'support@notifyedu.com',
                    phone: '+91 99999 88888',
                    copyright: '© {year} NotifyEdu. All rights reserved.'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchFooterInfo();
    }, []);

    const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };
    
    const copyrightText = footerInfo?.copyright.replace('{year}', new Date().getFullYear().toString()) || `© ${new Date().getFullYear()} NotifyEdu. All rights reserved.`;

    if (loading) {
        return <div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse"></div>;
    }

    const renderLink = (link: {href: string, title: string}) => {
        if (link.href.startsWith('#')) {
            return <a key={link.href} href={link.href} onClick={(e) => handleScrollTo(e, link.href.substring(1))} className="hover:text-primary transition-colors">{link.title}</a>
        }
        return <Link key={link.href} to={link.href} className="hover:text-primary transition-colors">{link.title}</Link>;
    }

    return (
        <footer id="contact" className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <div className="relative bg-white dark:bg-gray-900 pt-16 pb-12">
                {/* SVG Wave */}
                <div className="absolute top-0 inset-x-0">
                    <svg className="w-full h-16 sm:h-24" viewBox="0 0 1440 120" preserveAspectRatio="none">
                        <path className="fill-current text-gray-100 dark:text-gray-800" d="M1440,21.2101911 L1440,120 L0,120 L0,21.2101911 C120,35.0835244 240,42 360,42 C480,42 600,35.0835244 720,21.2101911 C840,7.3368578 960,0.416857801 1080,0.416857801 C1200,0.416857801 1320,7.3368578 1440,21.2101911 Z" />
                    </svg>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* About */}
                        <div className="md:col-span-2 space-y-4">
                             <div className="flex items-center space-x-2 logo-container">
                                <AnimatedLogo />
                                <span className="text-2xl font-bold text-neutral dark:text-gray-100">NotifyEdu</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                                Modernizing school attendance and communication with smart, real-time solutions for a connected educational experience.
                            </p>
                        </div>
                        
                        {/* Navigation */}
                        <div className="space-y-4">
                            <h4 className="font-semibold text-neutral dark:text-gray-200 uppercase tracking-wider">Navigate</h4>
                            <nav className="flex flex-col space-y-2 text-sm">
                               {footerInfo?.navLinks.map(link => renderLink(link))}
                            </nav>
                        </div>

                        {/* Contact */}
                        <div className="space-y-4">
                             <h4 className="font-semibold text-neutral dark:text-gray-200 uppercase tracking-wider">Get In Touch</h4>
                             <div className="text-sm space-y-2">
                                <p>
                                    <a href={`mailto:${footerInfo?.email}`} className="hover:text-primary transition-colors">{footerInfo?.email}</a>
                                </p>
                                <p>
                                    <a href={`tel:${footerInfo?.phone}`} className="hover:text-primary transition-colors">{footerInfo?.phone}</a>
                                </p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p>{copyrightText}</p>
                    <Link to="/login?for=admin" className="text-xs hover:text-primary dark:hover:text-primary-hover transition-colors">
                        Admin Portal
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;