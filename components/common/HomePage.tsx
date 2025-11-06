import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import { UserType } from '../../types';
import Footer from './Footer';
import AnimatedLogo from './AnimatedLogo';

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

const FeaturesIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>);
const HowItWorksIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>);
const TeachersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a3.001 3.001 0 015.688 0M12 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const ContactIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>);
const GuardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>);
const BusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 14v5H6a2 2 0 01-2-2v-3h4zm12-9h-4V3a1 1 0 00-1-1H9a1 1 0 00-1 1v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2zM8 9h8v3H8V9z" /></svg>);
const AcademicIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>);


const HomePageHeader: React.FC = () => {
    const { user } = useAuth();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.classList.add('body-no-scroll');
        } else {
            document.body.classList.remove('body-no-scroll');
        }
        return () => {
            document.body.classList.remove('body-no-scroll');
        };
    }, [isMobileMenuOpen]);

    const getDashboardLink = () => {
        if (!user) return "/login";
        switch (user.type) {
            case UserType.School: return "/school";
            case UserType.Student: return "/student";
            case UserType.Guard: return "/guard";
            case UserType.Bus: return "/bus";
            case UserType.AcademicWork: return "/academic-work";
            case UserType.SuperAdmin: return "/portal-admin-console";
            default: return "/login";
        }
    };
    
    const navItems = [
        { href: '#features', title: 'Features', icon: <FeaturesIcon /> },
        { href: '#how-it-works', title: 'How It Works', icon: <HowItWorksIcon /> },
        { href: '/teacher-portal', title: 'Teachers', icon: <TeachersIcon /> },
        { href: '#contact', title: 'Contact', icon: <ContactIcon /> },
        { href: '/login?for=guard', title: 'Guard Login', icon: <GuardIcon /> },
        { href: '/login?for=bus', title: 'Bus Login', icon: <BusIcon /> },
        { href: '/login?for=academic_work', title: 'Academic Login', icon: <AcademicIcon /> },
    ];

    return (
        <>
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/" className="flex items-center space-x-2 logo-container">
                            <AnimatedLogo />
                            <span className="text-2xl font-bold text-neutral dark:text-gray-100">NotifyEdu</span>
                        </Link>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600 dark:text-gray-300">
                               <a href="#features" onClick={(e) => handleScrollTo(e, 'features')} className="hover:text-primary transition-colors">Features</a>
                               <a href="#how-it-works" onClick={(e) => handleScrollTo(e, 'how-it-works')} className="hover:text-primary transition-colors">How It Works</a>
                               <Link to="/teacher-portal" className="hover:text-primary transition-colors">Teachers</Link>
                               <a href="#contact" onClick={(e) => handleScrollTo(e, 'contact')} className="hover:text-primary transition-colors">Contact</a>
                               <div className="h-4 border-l border-gray-300 dark:border-gray-600"></div>
                               <Link to="/login?for=academic_work" className="hover:text-primary transition-colors">Academic Login</Link>
                               <Link to="/login?for=guard" className="hover:text-primary transition-colors">Guard Login</Link>
                               <Link to="/login?for=bus" className="hover:text-primary transition-colors">Bus Login</Link>
                            </nav>
                            <ThemeToggle />
                            {user ? (
                                <Link to={getDashboardLink()} className="hidden sm:block px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus transition-colors">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link to="/login" className="hidden sm:block px-4 py-2 text-sm font-medium text-primary bg-transparent border border-primary rounded-lg hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus transition-colors">
                                    Login
                                </Link>
                            )}
                            <div className="md:hidden">
                                <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Open menu">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <>
                {/* Overlay */}
                <div
                    className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-hidden="true"
                ></div>

                {/* Menu Panel */}
                <div
                    className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="mobile-menu-title"
                >
                    <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2 logo-container">
                            <AnimatedLogo />
                            <span id="mobile-menu-title" className="text-xl font-bold text-neutral dark:text-gray-100">NotifyEdu</span>
                        </Link>
                        <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close menu">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <nav className="p-4 flex-grow">
                        <ul className="space-y-2">
                           {navItems.map(item => (
                                <li key={item.title}>
                                    {item.href.startsWith('#') ? (
                                         <a href={item.href} onClick={(e) => { handleScrollTo(e, item.href.substring(1)); setMobileMenuOpen(false); }} className="flex items-center p-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <span className="mr-4 text-primary">{item.icon}</span>
                                            {item.title}
                                        </a>
                                    ) : (
                                        <Link to={item.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center p-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <span className="mr-4 text-primary">{item.icon}</span>
                                            {item.title}
                                        </Link>
                                    )}
                                </li>
                           ))}
                        </ul>
                    </nav>
                     <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
                           {user ? (
                                <Link to={getDashboardLink()} onClick={() => setMobileMenuOpen(false)} className="block w-full text-center px-4 py-3 text-base font-semibold text-white bg-primary rounded-lg">Dashboard</Link>
                            ) : (
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full text-center px-4 py-3 text-base font-semibold text-primary border-2 border-primary rounded-lg">Login</Link>
                            )}
                       </div>
                </div>
            </>
        </>
    );
};

const HeroVisual: React.FC = () => (
    <div className="relative w-full max-w-lg mx-auto mt-12 lg:mt-0 lg:max-w-none lg:w-1/2">
        <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute w-full h-full bg-gradient-to-tr from-primary to-secondary opacity-20 dark:opacity-30 rounded-full blur-3xl"></div>
            <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg p-4 rounded-2xl shadow-2xl transform rotate-3 transition-transform duration-500 hover:rotate-0 hover:scale-105">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-neutral dark:text-gray-200">Attendance Summary</span>
                        <div className="flex space-x-1">
                            <span className="w-3 h-3 bg-red-400 rounded-full"></span>
                            <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                            <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <span className="text-sm text-gray-700 dark:text-gray-300">✅ Present</span>
                            <div className="w-2/3 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5"><div className="bg-green-500 h-2.5 rounded-full" style={{width: '92%'}}></div></div>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <span className="text-sm text-gray-700 dark:text-gray-300">❌ Absent</span>
                            <div className="w-2/3 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5"><div className="bg-red-500 h-2.5 rounded-full" style={{width: '8%'}}></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const HeroSection: React.FC = () => (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-900 dark:to-emerald-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="lg:flex lg:items-center lg:gap-12">
                <div className="lg:w-1/2 text-center lg:text-left">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral dark:text-gray-100 tracking-tight">
                        The All-in-One <span className="text-primary">School Management System</span>
                    </h1>
                    <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg text-gray-600 dark:text-gray-300">
                        NotifyEdu, the premier school management software, streamlines attendance tracking with QR, Biometric Finger ID, and manual entry, keeping parents instantly informed.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
                        <Link to="/get-started" className="w-full sm:w-auto px-8 py-3 text-base font-semibold text-white bg-primary rounded-full shadow-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus transform hover:scale-105 transition-transform duration-300">
                            Get Started
                        </Link>
                        <a href="#features" onClick={(e) => handleScrollTo(e, 'features')} className="w-full sm:w-auto px-8 py-3 text-base font-semibold text-neutral dark:text-gray-200 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus transform hover:scale-105 transition-transform duration-300">
                            Learn More
                        </a>
                    </div>
                </div>
                <HeroVisual />
            </div>
        </div>
    </section>
);

const features = [
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    title: 'Real-time Attendance Tracking',
    description: 'Our school management system effortlessly tracks student presence with multiple modes: QR code scanning, Biometric Fingerprint, or manual entry.',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    title: 'Instant Parent Notifications',
    description: 'Keep parents in the loop with automated browser notifications for check-ins, check-outs, and absences—a key feature of modern student management software.',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    title: 'Student & Parent Portal',
    description: 'Empower students and parents with a dedicated portal to view attendance records, trends, and fee status, central to our student management system.',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    title: 'Complete Fee Management',
    description: 'Simplify fee tracking for your school. Our management software lets you view total fees, paid amounts, and outstanding balances at a glance.',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    title: 'Direct Communication',
    description: 'Our school management platform facilitates communication between the school and parents with a built-in messaging and complaint submission system.',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    title: 'Secure & Scalable',
    description: 'Built on a robust cloud infrastructure, our student management system ensures your data is safe, secure, and accessible anytime, anywhere.',
  },
];

const FeaturesSection: React.FC = () => (
    <section id="features" className="py-20 sm:py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center animate-on-scroll">
                <h2 className="text-3xl font-extrabold text-neutral dark:text-gray-100">The Ultimate School Management Software</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
                    A comprehensive platform designed to connect schools, students, and parents.
                </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-on-scroll" style={{ transitionDelay: `${index * 100}ms` }}>
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 text-primary">
                            {feature.icon}
                        </div>
                        <h3 className="mt-5 text-lg font-semibold text-neutral dark:text-gray-100">{feature.title}</h3>
                        <p className="mt-2 text-base text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const HowItWorksSection: React.FC = () => (
    <section id="how-it-works" className="py-20 sm:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center animate-on-scroll">
                <h2 className="text-3xl font-extrabold text-neutral dark:text-gray-100">Get Started in 3 Simple Steps</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
                    Onboarding is quick and easy. Get your school management system online in minutes.
                </p>
            </div>
            <div className="mt-16 grid md:grid-cols-3 gap-12 relative">
                <div className="hidden md:block absolute top-10 left-1/2 -translate-x-1/2 w-2/3 h-0.5 border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                
                <div className="relative text-center animate-on-scroll delay-1">
                    <div className="flex items-center justify-center w-20 h-20 mx-auto bg-white dark:bg-gray-800 border-2 border-primary rounded-full shadow-lg z-10 relative">
                        <span className="text-3xl font-bold text-primary">1</span>
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-neutral dark:text-gray-100">Contact Us for Setup</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Get in touch to register your school. We'll set up your portal and provide admin credentials.</p>
                </div>
                 <div className="relative text-center animate-on-scroll delay-2">
                    <div className="flex items-center justify-center w-20 h-20 mx-auto bg-white dark:bg-gray-800 border-2 border-primary rounded-full shadow-lg z-10 relative">
                       <span className="text-3xl font-bold text-primary">2</span>
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-neutral dark:text-gray-100">Add Students</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Easily add students via the student management system, automatically generating their login details and unique QR codes.</p>
                </div>
                 <div className="relative text-center animate-on-scroll delay-3">
                    <div className="flex items-center justify-center w-20 h-20 mx-auto bg-white dark:bg-gray-800 border-2 border-primary rounded-full shadow-lg z-10 relative">
                       <span className="text-3xl font-bold text-primary">3</span>
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-neutral dark:text-gray-100">Start Tracking</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Begin marking attendance. Parents receive instant notifications and all data is logged in real-time.</p>
                </div>
            </div>
        </div>
    </section>
);

const CtaSection: React.FC = () => (
    <section id="cta" className="py-20 sm:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-on-scroll">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral dark:text-gray-100">Ready to Transform Your School's Attendance?</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Join the growing number of schools simplifying their daily operations with our student management software.</p>
            <div className="mt-8">
                 <Link to="/get-started" className="inline-block px-10 py-4 text-lg font-semibold text-white bg-primary rounded-full shadow-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus transform hover:scale-105 transition-transform duration-300">
                    Get Started Today
                </Link>
            </div>
        </div>
    </section>
);

const HomePage: React.FC = () => {
    const location = useLocation();

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the element is visible
        });

        const targets = document.querySelectorAll('.animate-on-scroll');
        targets.forEach(target => observer.observe(target));

        return () => targets.forEach(target => observer.unobserve(target));
    }, []);

    // Scroll to hash links
    useEffect(() => {
        if (location.hash) {
            const id = location.hash.substring(1);
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }, [location]);

    return (
        <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <HomePageHeader />
            <main>
                <HeroSection />
                <FeaturesSection />
                <HowItWorksSection />
                <CtaSection />
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;