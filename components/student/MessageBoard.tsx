import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { Message, Announcement } from '../../types';

interface MessageBoardProps {
  studentId: string;
  schoolId: string;
  token: string;
}

const MessageBoard: React.FC<MessageBoardProps> = ({ studentId, schoolId, token }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedMessages, fetchedAnnouncements] = await Promise.all([
        api.getMessagesForStudent(studentId, token),
        api.getAnnouncementsForSchool(schoolId, token)
      ]);
      setMessages(fetchedMessages);
      setAnnouncements(fetchedAnnouncements);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [studentId, schoolId, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-neutral dark:text-gray-200 mb-4">Announcements & Messages</h2>
      {loading ? (
        <p className="text-center text-gray-500 dark:text-gray-400">Loading messages...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : messages.length === 0 && announcements.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No communications from the school yet.</p>
      ) : (
        <div className="space-y-6 max-h-80 overflow-y-auto pr-2">
            {/* Announcements Section */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 border-b dark:border-gray-600 pb-1">Announcements</h3>
                {announcements.length > 0 ? (
                    <div className="space-y-3">
                        {announcements.map(announcement => (
                            <div key={announcement.announcement_id} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border-l-4 border-blue-400">
                                <p className="font-bold text-blue-800 dark:text-blue-200">{announcement.title}</p>
                                <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-wrap">{announcement.content}</p>
                                <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {new Date(announcement.timestamp).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-sm text-gray-500 dark:text-gray-400">No new announcements.</p>}
            </div>

            {/* Messages Section */}
            <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 border-b dark:border-gray-600 pb-1">Personal Messages</h3>
                {messages.length > 0 ? (
                    <div className="space-y-3">
                    {messages.map(message => (
                        <div key={message.message_id} className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
                        <p className="text-sm text-gray-800 dark:text-gray-200">{message.text}</p>
                        <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {new Date(message.timestamp).toLocaleString()}
                        </p>
                        </div>
                    ))}
                    </div>
                ): <p className="text-sm text-gray-500 dark:text-gray-400">No personal messages.</p>}
            </div>
        </div>
      )}
    </div>
  );
};

export default MessageBoard;