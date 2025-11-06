import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Agent, ContactInfo } from '../../types';
import AnimatedLogo from './AnimatedLogo';

const AgentProfilePage: React.FC = () => {
    const { agentId } = useParams<{ agentId: string }>();
    const [agent, setAgent] = useState<Agent | null>(null);
    const [businessInfo, setBusinessInfo] = useState<ContactInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!agentId) {
            setError("Agent ID is missing.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const [agentData, businessData] = await Promise.all([
                    api.getAgentById(agentId),
                    api.getContactInfo()
                ]);
                setAgent(agentData);
                setBusinessInfo(businessData);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [agentId]);

    const renderSkeleton = () => (
        <div className="w-full max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 animate-pulse">
            <div className="relative -mt-20">
                <div className="w-28 h-28 mx-auto bg-gray-300 dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"></div>
            </div>
            <div className="mt-4 text-center">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
                <div className="mt-4 h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6 mx-auto"></div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
            </div>
        </div>
    );

    const renderContent = () => {
        if (loading) return renderSkeleton();
        if (error) return <p className="text-center text-red-500 bg-white/80 p-4 rounded-lg">{error}</p>;
        if (!agent || !businessInfo) return <p className="text-center">Agent information not found.</p>;

        return (
            <div className="w-full max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                <div className="relative -mt-20">
                    <img 
                        src={`data:image/png;base64,${agent.photoBase64}`} 
                        alt={agent.name} 
                        className="w-28 h-28 object-cover mx-auto rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
                    />
                </div>
                
                <div className="mt-4 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{agent.name}</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{agent.content}</p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{businessInfo.title}</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">{businessInfo.description}</p>
                    <div className="mt-4 space-y-2 text-sm">
                        <p><a href={`tel:${businessInfo.phone}`} className="text-primary hover:underline">{businessInfo.phone}</a></p>
                        <p><a href={`mailto:${businessInfo.email}`} className="text-primary hover:underline">{businessInfo.email}</a></p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 pt-10">
            <header className="absolute top-0 left-0 right-0 p-4">
                 <Link to="/" className="flex items-center space-x-2 logo-container w-fit">
                    <AnimatedLogo />
                    <span className="text-xl font-bold text-neutral dark:text-gray-100">NotifyEdu</span>
                </Link>
            </header>
            <main className="pt-20 pb-10 px-4">
                {renderContent()}
            </main>
        </div>
    );
};

export default AgentProfilePage;