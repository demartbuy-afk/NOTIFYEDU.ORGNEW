import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
// FIX: Import UserType to use enum for role checking instead of a hardcoded string.
import { School, UserType, Agent } from '../../types';
import Header from '../common/Header';
import AddSchoolModal from './AddSchoolModal';
import EditSchoolModal from './EditSchoolModal';
import AdminSettingsManager from './AdminSettingsManager';
import FooterSettingsManager from './FooterSettingsManager';
import { downloadCSV } from '../../utils/csv';
import AgentManager from './AgentManager';

const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [downloadingSchoolId, setDownloadingSchoolId] = useState<string | null>(null);


  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchSchools = useCallback(async () => {
    if (user) {
      setLoading(true);
      setError(null);
      try {
        const schoolData = await api.getAllSchools(user.token);
        setSchools(schoolData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);
  
  const fetchAgents = useCallback(async () => {
      if (user) {
          try {
              const agentData = await api.getAgents(user.token);
              setAgents(agentData);
          } catch (err) {
              // Don't set the main error for this, as it's a secondary fetch
              console.error("Failed to fetch agents:", (err as Error).message);
          }
      }
  }, [user]);

  useEffect(() => {
    fetchSchools();
    fetchAgents();
  }, [fetchSchools, fetchAgents]);

  const handleSchoolAdded = (newSchool: School) => {
    setSchools(prev => [...prev, newSchool]);
    showToast(`School "${newSchool.name}" added successfully.`);
  };
  
  const handleSchoolUpdated = (updatedSchool: School) => {
    setSchools(prev => prev.map(s => s.id === updatedSchool.id ? updatedSchool : s));
    showToast(`School "${updatedSchool.name}" updated successfully.`);
    setEditingSchool(null);
  }
  
  const handleAgentAdded = (newAgent: Agent) => {
      setAgents(prev => [...prev, newAgent]);
      showToast(`Agent "${newAgent.name}" added successfully.`);
  };

  const handleAgentUpdated = (updatedAgent: Agent) => {
      setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
      showToast(`Agent "${updatedAgent.name}" updated successfully.`);
  };

  const handleAgentDeleted = (agentId: string) => {
      const agentName = agents.find(a => a.id === agentId)?.name || 'Agent';
      setAgents(prev => prev.filter(a => a.id !== agentId));
      showToast(`"${agentName}" deleted successfully.`);
  };


  const handleToggleLock = async (school: School) => {
    if (!user) return;
    const newStatus = school.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    try {
        const updatedSchool = await api.updateSchool(user.token, school.id, { status: newStatus });
        handleSchoolUpdated(updatedSchool);
    } catch(err) {
        showToast(`Failed to update status for ${school.name}.`);
    }
  };

  const handleDownloadReport = async (school: School) => {
    if (!user || downloadingSchoolId) return;
    setDownloadingSchoolId(school.id);
    try {
      const students = await api.adminGetStudentsForSchool(user.token, school.id);
      if (students.length === 0) {
        showToast(`No students found for ${school.name}.`);
        return;
      }
      const headers = ['Student ID', 'Name', 'Roll No.', 'Class', 'Parent Phone'];
      const data = students.map(s => [s.student_id, s.name, s.roll_no, s.class, s.parent_phone]);
      
      downloadCSV(headers, data, `${school.name.replace(/\s+/g, '_')}_students_report.csv`);
      showToast('Student report downloaded.');

    } catch (err) {
        showToast(`Error downloading report: ${(err as Error).message}`);
    } finally {
        setDownloadingSchoolId(null);
    }
  };


  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }
    if (error) {
      return <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">School Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Students</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Subscription Expiry</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {schools.map(school => (
              <tr key={school.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{school.name}</div>
                    <div className="text-xs text-gray-500">{school.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700 dark:text-gray-300 font-semibold">{school.student_count ?? 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {school.status === 'ACTIVE' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">ACTIVE</span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">LOCKED</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(school.subscription_expiry_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center items-center space-x-4">
                    <button onClick={() => setEditingSchool(school)} className="text-primary hover:text-primary-focus">Edit</button>
                    <button onClick={() => handleToggleLock(school)} className={school.status === 'ACTIVE' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}>
                        {school.status === 'ACTIVE' ? 'Lock' : 'Unlock'}
                    </button>
                    <button 
                        onClick={() => handleDownloadReport(school)} 
                        className="text-secondary hover:text-secondary-focus disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={downloadingSchoolId === school.id}
                    >
                        {downloadingSchoolId === school.id ? 'Downloading...' : 'Report'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // FIX: Use UserType enum for consistent and type-safe role checking.
  if (!user || user.type !== UserType.SuperAdmin) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-neutral dark:text-gray-200">School Management</h1>
                <button onClick={() => setAddModalOpen(true)} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-75">
                    + Add New School
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              {renderContent()}
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <AgentManager
                agents={agents}
                onAgentAdded={handleAgentAdded}
                onAgentUpdated={handleAgentUpdated}
                onAgentDeleted={handleAgentDeleted}
            />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <AdminSettingsManager showToast={showToast} />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <FooterSettingsManager showToast={showToast} />
        </div>
      </main>

      {isAddModalOpen && (
        <AddSchoolModal
          isOpen={isAddModalOpen}
          onClose={() => setAddModalOpen(false)}
          token={user.token}
          onSchoolAdded={handleSchoolAdded}
        />
      )}
      {editingSchool && (
        <EditSchoolModal
          isOpen={!!editingSchool}
          onClose={() => setEditingSchool(null)}
          school={editingSchool}
          token={user.token}
          onSuccess={handleSchoolUpdated}
        />
      )}
      
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg animate-bounce">
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default SuperAdminDashboard;