import React from 'react';

type AcademicTab = 'attendance' | 'fees' | 'examResults' | 'complaints' | 'announcements' | 'classSettings';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AcademicTab;
  setActiveTab: (tab: AcademicTab) => void;
  menuItems: { id: AcademicTab; title: string; icon: React.ReactNode }[];
}

const AcademicMobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, activeTab, setActiveTab, menuItems }) => {
  const handleTabClick = (tab: AcademicTab) => {
    setActiveTab(tab);
    onClose();
  };
  
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Menu Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-neutral dark:text-gray-100">Academic Menu</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex items-center w-full p-3 rounded-lg text-left transition-colors ${
                activeTab === item.id 
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 font-semibold' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-4">{item.icon}</span>
              {item.title}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default AcademicMobileMenu;