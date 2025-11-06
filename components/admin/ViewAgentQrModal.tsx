import React from 'react';
import { Agent } from '../../types';
import { QRCodeSVG } from 'qrcode.react';

interface ViewAgentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
}

const ViewAgentQrModal: React.FC<ViewAgentQrModalProps> = ({ isOpen, onClose, agent }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
            QR Code for {agent.name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
        </div>
        <div className="p-6 text-center space-y-4">
            <div className="flex justify-center bg-white p-4 rounded-lg">
                <QRCodeSVG value={agent.qrValue} size={200} level="H" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Scan this code to view the public profile page.</p>
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-hover">
              Done
            </button>
        </div>
      </div>
    </div>
  );
};

export default ViewAgentQrModal;