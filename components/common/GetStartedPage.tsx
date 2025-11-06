import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const SchoolIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

const StudentIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const HomeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

interface ChoicePanelProps {
    to: string;
    bgColor: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    buttonText: string;
    buttonTextColor: string;
}

const ChoicePanel: React.FC<ChoicePanelProps> = ({ to, bgColor, icon, title, description, buttonText, buttonTextColor }) => {
    return (
        <Link 
            to={to} 
            className={`group relative flex-1 flex flex-col items-center justify-center p-8 text-white text-center overflow-hidden transition-all duration-500 ease-in-out`}
        >
            <div className={`absolute inset-0 ${bgColor} z-0`}></div>
            <div 
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_rgba(255,255,255,0)_70%)] opacity-50 group-hover:scale-150 transition-transform duration-700 ease-in-out"
                style={{ backgroundSize: '200% 200%' }}
            ></div>
            
            <div className="relative z-10 space-y-6 transform group-hover:scale-105 transition-transform duration-500">
                <div className="w-24 h-24 mx-auto flex items-center justify-center border-2 border-white/50 rounded-full bg-white/10 backdrop-blur-sm">
                    {icon}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
                <p className="max-w-sm text-white/80">{description}</p>
                <div 
                    className={`inline-block mt-4 px-8 py-3 text-base font-semibold bg-white ${buttonTextColor} rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
                >
                    {buttonText} <span className="ml-2 inline-block transform group-hover:translate-x-2 transition-transform duration-300">&rarr;</span>
                </div>
            </div>
        </Link>
    );
};

const GetStartedPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gray-100 dark:bg-gray-800">
        <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
            <Link to="/" title="Go to Homepage" className="p-2 rounded-full text-white bg-black/20 hover:bg-black/40 transition-colors">
                <HomeIcon />
            </Link>
            <ThemeToggle />
        </div>
      
        <ChoicePanel
            to="/register-info"
            bgColor="bg-primary"
            icon={<SchoolIcon />}
            title="For Schools"
            description="Register to manage students, track attendance, and communicate with parents seamlessly."
            buttonText="Register School"
            buttonTextColor="text-primary"
        />
        <ChoicePanel
            to="/login"
            bgColor="bg-secondary"
            icon={<StudentIcon />}
            title="For School & Student"
            description="Access your attendance records, fee status, and announcements from your school."
            buttonText="Go to Login"
            buttonTextColor="text-secondary"
        />
    </div>
  );
};

export default GetStartedPage;