import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { ContactInfo } from '../../types';
import ThemeToggle from './ThemeToggle';
import AnimatedLogo from './AnimatedLogo';

const PublicPageHeader: React.FC<{ title: string; showLogin?: boolean; }> = ({ title, showLogin = true }) => {
    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2 logo-container">
                        <AnimatedLogo />
                        <span className="text-2xl font-bold text-neutral dark:text-gray-100">{title}</span>
                    </Link>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <ThemeToggle />
                        {showLogin && (
                            <Link to="/login" className="px-4 py-2 text-sm font-medium text-primary bg-transparent border border-primary rounded-lg hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus transition-colors">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

const RegisterInfoPage: React.FC = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const data = await api.getContactInfo();
        if (data) {
          setContactInfo(data);
        } else {
          // Fallback data if API returns nothing
          setContactInfo({
            title: 'Get Started with NotifyEdu',
            description: 'To register your school and get started with our platform, please reach out to our support team. We will guide you through the setup process and provide you with your school\'s administrative credentials.',
            email: 'contact@notifyedu.com',
            phone: '+91 12345 67890'
          });
        }
      } catch (err) {
        setError('Failed to load contact information. Please try again later.');
         // Fallback data on error
         setContactInfo({
            title: 'Get Started with NotifyEdu',
            description: 'To register your school and get started with our platform, please reach out to our support team. We will guide you through the setup process and provide you with your school\'s administrative credentials.',
            email: 'contact@notifyedu.com',
            phone: '+91 12345 67890'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchContactInfo();
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
      <PublicPageHeader title="NotifyEdu" />
      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-4xl mx-auto py-16 sm:py-24 px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center">
                {loading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                ) : (
                    <>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-neutral dark:text-gray-100 tracking-tight">
                        {contactInfo?.title || 'Get Started with NotifyEdu'}
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
                        {contactInfo?.description || 'Contact us to begin.'}
                    </p>
                    </>
                )}
            </div>

            {error && !loading && (
                 <div className="mt-8 text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</div>
            )}

            {!loading && contactInfo && (
                <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-neutral dark:text-gray-100">Email Us</h3>
                                <p className="mt-1 text-gray-600 dark:text-gray-300">Our team will get back to you within 24 hours.</p>
                                <a href={`mailto:${contactInfo.email}`} className="mt-2 text-primary font-semibold hover:underline">{contactInfo.email}</a>
                            </div>
                        </div>

                         <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 text-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-neutral dark:text-gray-100">Call Us</h3>
                                <p className="mt-1 text-gray-600 dark:text-gray-300">Talk to our team during business hours.</p>
                                <a href={`tel:${contactInfo.phone}`} className="mt-2 text-primary font-semibold hover:underline">{contactInfo.phone}</a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};
export default RegisterInfoPage;