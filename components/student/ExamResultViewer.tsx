import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { Student, ExamSession, StudentResult } from '../../types';

interface ExamResultViewerProps {
    student: Student;
}

interface RankedResult extends StudentResult {
    rank: number;
}

const ExamResultViewer: React.FC<ExamResultViewerProps> = ({ student }) => {
    const [sessions, setSessions] = useState<ExamSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<string>('');
    const [results, setResults] = useState<RankedResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        api.getExamSessions(student.token, student.school_id)
            .then(data => {
                setSessions(data);
                if (data.length > 0) {
                    setSelectedSession(data[0].id);
                }
            })
            .catch(err => setError((err as Error).message))
            .finally(() => setLoading(false));
    }, [student]);

    useEffect(() => {
        if (!selectedSession) {
            setResults([]);
            return;
        };
        setLoading(true);
        api.getResultsForClass(student.token, student.school_id, selectedSession, student.class as any)
            .then(data => {
                const sorted = data.sort((a, b) => b.percentage - a.percentage);
                const ranked = sorted.map((res, index) => ({...res, rank: index + 1}));
                setResults(ranked);
            })
            .catch(err => setError((err as Error).message))
            .finally(() => setLoading(false));
    }, [selectedSession, student]);
    
    const myResult = useMemo(() => {
        return results.find(r => r.studentId === student.student_id);
    }, [results, student]);

    const topTen = useMemo(() => results.slice(0, 10), [results]);
    const podium = useMemo(() => {
        return {
            first: topTen.find(r => r.rank === 1),
            second: topTen.find(r => r.rank === 2),
            third: topTen.find(r => r.rank === 3),
        }
    }, [topTen]);

    const renderContent = () => {
        if (loading) return <p className="text-center text-gray-500 dark:text-gray-400">Loading results...</p>;
        if (error) return <p className="text-center text-red-500">{error}</p>;
        if (results.length === 0) return <p className="text-center text-gray-500 dark:text-gray-400">Results for this session are not yet published.</p>;

        return (
            <div className="space-y-8">
                {/* Podium */}
                <div className="flex justify-center items-end gap-2 md:gap-4 px-4 pt-8">
                    {podium.third && <PodiumStep result={podium.third} emoji="🥉" rank="3rd" height="h-24" order="podium-third" />}
                    {podium.first && <PodiumStep result={podium.first} emoji="🥇" rank="1st" height="h-36" order="podium-first" />}
                    {podium.second && <PodiumStep result={podium.second} emoji="🥈" rank="2nd" height="h-28" order="podium-second" />}
                </div>

                {/* Other top performers */}
                {topTen.length > 3 && (
                     <div className="space-y-2 max-w-lg mx-auto">
                        {topTen.slice(3).map(res => (
                            <div key={res.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-500 dark:text-gray-400">{res.rank}.</span>
                                    <p className="font-semibold text-sm text-neutral dark:text-gray-200">{res.studentName}</p>
                                </div>
                                <p className="font-semibold text-sm text-primary">{res.percentage.toFixed(2)}%</p>
                            </div>
                        ))}
                     </div>
                )}
                
                {/* My Result Card */}
                {myResult && (
                    <div className="mt-10 p-6 bg-primary/5 dark:bg-primary/10 border-2 border-primary rounded-lg shadow-lg">
                        <h3 className="text-xl font-bold text-primary mb-4">Your Result</h3>
                        <div className="flex justify-between items-baseline mb-4">
                            <p>Rank: <span className="text-2xl font-bold">{myResult.rank}</span> / {results.length}</p>
                            <p>Percentage: <span className="text-2xl font-bold">{myResult.percentage.toFixed(2)}%</span></p>
                        </div>
                        <div className="space-y-2">
                            {myResult.marks.map((m, i) => (
                                <div key={i} className="flex justify-between text-sm border-b border-primary/10 pb-1">
                                    <span className="text-gray-600 dark:text-gray-300">{m.subjectName}</span>
                                    <span className="font-semibold">{m.marksObtained} / {m.totalMarks}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between font-bold mt-2 pt-2 border-t-2 border-primary/20">
                            <span>Total</span>
                            <span>{myResult.totalMarksObtained} / {myResult.totalMaxMarks}</span>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                <h2 className="text-2xl font-bold text-neutral dark:text-gray-200">Exam Results</h2>
                <select value={selectedSession} onChange={e => setSelectedSession(e.target.value)} className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md">
                    {sessions.length > 0 ? (
                        sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                    ) : <option>No sessions found</option>}
                </select>
            </div>
            {renderContent()}
        </div>
    );
};

interface PodiumStepProps {
    result: RankedResult;
    emoji: string;
    rank: string;
    height: string;
    order: string;
}
const PodiumStep: React.FC<PodiumStepProps> = ({ result, emoji, rank, height, order }) => (
    <div className={`podium-step ${order} flex flex-col items-center justify-end text-center w-1/3`}>
        <p className="text-sm font-bold truncate w-full">{result.studentName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{result.percentage.toFixed(2)}%</p>
        <div className={`flex items-center justify-center p-3 rounded-t-lg bg-gray-200 dark:bg-gray-700 w-full mt-1 ${height}`}>
            <span className="text-3xl md:text-4xl">{emoji}</span>
            <span className="font-bold text-lg md:text-xl ml-2">{rank}</span>
        </div>
    </div>
)


export default ExamResultViewer;